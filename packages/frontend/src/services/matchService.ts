import api from './api';
import { supabase } from '../supabaseClient';
import { calculateDistance } from '../utils/locationUtils';

interface Duo {
  id: string;
  title: string;
  bio?: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  location?: string;
  distance?: number; // Distance from user's duo in kilometers
  user1: {
    id: string;
    name: string;
    photos: string[];
  };
  user2: {
    id: string;
    name: string;
    photos: string[];
  };
}

interface Match {
  id: string;
  duoA: Duo;
  duoB: Duo;
  isMatched: boolean;
  createdAt: string;
}

// Get potential matches (swipe deck) with location preference
export const getPotentialMatches = async (duoId: string): Promise<Duo[]> => {
  try {
    // First, get the current duo to access its location
    const { data: currentDuo, error: duoError } = await supabase
      .from('duos')
      .select(`
        id,
        latitude,
        longitude,
        location
      `)
      .eq('id', duoId)
      .single();
    
    if (duoError) {
      console.error('Error fetching current duo:', duoError);
      // Fall back to the original implementation
      const response = await api.get<Duo[]>(`/match/swipe?duoId=${duoId}`);
      return response.data;
    }
    
    // Fetch potential matches - duos that haven't been liked or disliked yet
    const { data: existingInteractions, error: interactionsError } = await supabase
      .from('duo_interactions')
      .select('target_duo_id')
      .eq('source_duo_id', duoId);
    
    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
      const response = await api.get<Duo[]>(`/match/swipe?duoId=${duoId}`);
      return response.data;
    }
    
    // Extract IDs of duos that have already been interacted with
    const interactedDuoIds = existingInteractions?.map(i => i.target_duo_id) || [];
    // Add the current duo ID to exclude it from results
    interactedDuoIds.push(duoId);
    
    // Fetch all potential duos that haven't been interacted with
    const { data: potentialDuos, error: potentialError } = await supabase
      .from('duos')
      .select(`
        id,
        title,
        bio,
        photos,
        latitude,
        longitude,
        location,
        user1:user1_id(id, name, photos),
        user2:user2_id(id, name, photos)
      `)
      .not('id', 'in', interactedDuoIds);
    
    if (potentialError || !potentialDuos) {
      console.error('Error fetching potential duos:', potentialError);
      const response = await api.get<Duo[]>(`/match/swipe?duoId=${duoId}`);
      return response.data;
    }
    
    // If current duo has location, sort by distance
    if (currentDuo?.latitude && currentDuo?.longitude) {
      // Calculate distance for each potential duo
      const duosWithDistance = potentialDuos.map(duo => {
        let distance = undefined;
        
        // If the potential duo has location data, calculate distance
        if (duo.latitude && duo.longitude) {
          distance = calculateDistance(
            currentDuo.latitude,
            currentDuo.longitude,
            duo.latitude,
            duo.longitude
          );
        }
        
        return {
          ...duo,
          distance
        };
      });
      
      // Sort by distance (nulls last)
      duosWithDistance.sort((a, b) => {
        // If both have distance, sort by distance
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        // If only a has distance, it comes first
        if (a.distance !== undefined) return -1;
        // If only b has distance, it comes first
        if (b.distance !== undefined) return 1;
        // If neither has distance, keep original order
        return 0;
      });
      
      return duosWithDistance;
    }
    
    // If no location data, return unsorted results
    return potentialDuos;
  } catch (error) {
    console.error('Error in getPotentialMatches:', error);
    // Fall back to the original implementation
    const response = await api.get<Duo[]>(`/match/swipe?duoId=${duoId}`);
    return response.data;
  }
};

// Like a duo
export const likeDuo = async (likerDuoId: string, likedDuoId: string): Promise<{ match?: Match }> => {
  // Record the interaction
  await supabase
    .from('duo_interactions')
    .insert({
      source_duo_id: likerDuoId,
      target_duo_id: likedDuoId,
      action: 'like'
    });
    
  // Check if there's a mutual like (a match)
  const { data: mutualLike } = await supabase
    .from('duo_interactions')
    .select()
    .eq('source_duo_id', likedDuoId)
    .eq('target_duo_id', likerDuoId)
    .eq('action', 'like')
    .maybeSingle();
  
  if (mutualLike) {
    // It's a match! Create a match record
    const { data: match } = await supabase
      .from('matches')
      .insert({
        duo_a_id: likerDuoId,
        duo_b_id: likedDuoId,
        is_matched: true
      })
      .select()
      .single();
      
    if (match) {
      // Fetch complete duo information
      const { data: duoA } = await supabase
        .from('duos')
        .select(`
          id, title, bio, photos, latitude, longitude, location,
          user1:user1_id(id, name, photos),
          user2:user2_id(id, name, photos)
        `)
        .eq('id', likerDuoId)
        .single();
        
      const { data: duoB } = await supabase
        .from('duos')
        .select(`
          id, title, bio, photos, latitude, longitude, location,
          user1:user1_id(id, name, photos),
          user2:user2_id(id, name, photos)
        `)
        .eq('id', likedDuoId)
        .single();
      
      return { 
        match: {
          id: match.id,
          duoA: duoA!,
          duoB: duoB!,
          isMatched: true,
          createdAt: match.created_at
        } 
      };
    }
  }
  
  return { match: undefined };
};

// Dislike a duo
export const dislikeDuo = async (dislikerDuoId: string, dislikedDuoId: string): Promise<void> => {
  // Record the dislike interaction
  await supabase
    .from('duo_interactions')
    .insert({
      source_duo_id: dislikerDuoId,
      target_duo_id: dislikedDuoId,
      action: 'dislike'
    });
};

// Get all matches
export const getMatches = async (duoId: string): Promise<Match[]> => {
  // Fetch matches where the duo is either duo_a or duo_b
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, 
      is_matched, 
      created_at,
      duoA:duo_a_id(
        id, title, bio, photos, latitude, longitude, location,
        user1:user1_id(id, name, photos),
        user2:user2_id(id, name, photos)
      ),
      duoB:duo_b_id(
        id, title, bio, photos, latitude, longitude, location,
        user1:user1_id(id, name, photos),
        user2:user2_id(id, name, photos)
      )
    `)
    .or(`duo_a_id.eq.${duoId},duo_b_id.eq.${duoId}`)
    .eq('is_matched', true);
    
  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
  
  // Transform the data to match the expected interface
  return data.map(match => ({
    id: match.id,
    duoA: match.duoA,
    duoB: match.duoB,
    isMatched: match.is_matched,
    createdAt: match.created_at
  }));
}; 