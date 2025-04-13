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

export interface DuoProfile {
  id: string;
  title: string;
  bio: string;
  photos: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  user1_id: string;
  user2_id: string;
  user1?: {
    id: string;
    name: string;
    email: string;
  };
  user2?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DuoMatch {
  duo1_id: string;
  duo2_id: string;
  matched_at: string;
  duo1?: DuoProfile;
  duo2?: DuoProfile;
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

/**
 * Like a duo - records that your duo likes another duo
 * @param likerDuoId The ID of your duo
 * @param likedDuoId The ID of the duo you like
 * @returns Object with isMatch indicating if this created a mutual match
 */
export const likeDuo = async (likerDuoId: string, likedDuoId: string): Promise<{success: boolean, isMatch: boolean, error?: string}> => {
  try {
    // First check if the other duo already liked us (which would make this a match)
    const { data: existingLike, error: checkError } = await supabase
      .from('duo_matches')
      .select('id')
      .eq('liker_duo_id', likedDuoId)
      .eq('liked_duo_id', likerDuoId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, which is expected
      console.error('Error checking for existing like:', checkError);
      return { success: false, isMatch: false, error: checkError.message };
    }
    
    // Record the like
    const { data, error } = await supabase
      .from('duo_matches')
      .insert({
        liker_duo_id: likerDuoId,
        liked_duo_id: likedDuoId
      })
      .select()
      .single();
    
    if (error) {
      // If it's a unique violation, the like already exists, which is fine
      if (error.code === '23505') {
        return { success: true, isMatch: !!existingLike };
      }
      
      console.error('Error creating duo like:', error);
      return { success: false, isMatch: false, error: error.message };
    }
    
    console.log('Duo like recorded:', data);
    
    // Return whether this created a match
    return { success: true, isMatch: !!existingLike };
  } catch (err: any) {
    console.error('Error in likeDuo:', err);
    return { success: false, isMatch: false, error: err.message };
  }
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

/**
 * Get all duos that the specified duo has matched with
 * @param duoId The ID of your duo
 * @returns Array of matched duos with their profiles
 */
export const getMatches = async (duoId: string): Promise<{matches: DuoMatch[], error?: string}> => {
  try {
    // Get all matches where this duo is either duo1 or duo2
    const { data, error } = await supabase
      .from('matched_duos')
      .select(`
        duo1_id, duo2_id, matched_at,
        duo1:duo1_id(id, title, bio, photos, location, latitude, longitude, user1_id, user2_id),
        duo2:duo2_id(id, title, bio, photos, location, latitude, longitude, user1_id, user2_id)
      `)
      .or(`duo1_id.eq.${duoId},duo2_id.eq.${duoId}`);
    
    if (error) {
      console.error('Error getting duo matches:', error);
      return { matches: [], error: error.message };
    }
    
    console.log('Duo matches:', data);
    
    return { 
      matches: data as DuoMatch[] || []
    };
  } catch (err: any) {
    console.error('Error in getMatches:', err);
    return { matches: [], error: err.message };
  }
};

/**
 * Get all the duos that the current duo has liked
 * @param duoId The ID of your duo
 * @returns Array of duo IDs that have been liked
 */
export const getLikedDuos = async (duoId: string): Promise<{likedDuoIds: string[], error?: string}> => {
  try {
    const { data, error } = await supabase
      .from('duo_matches')
      .select('liked_duo_id')
      .eq('liker_duo_id', duoId);
    
    if (error) {
      console.error('Error getting liked duos:', error);
      return { likedDuoIds: [], error: error.message };
    }
    
    const likedDuoIds = data.map(item => item.liked_duo_id);
    console.log('Liked duo IDs:', likedDuoIds);
    
    return { likedDuoIds };
  } catch (err: any) {
    console.error('Error in getLikedDuos:', err);
    return { likedDuoIds: [], error: err.message };
  }
}; 