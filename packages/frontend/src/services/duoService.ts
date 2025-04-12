import { supabase } from '../supabaseClient';

interface Duo {
  id: string;
  title: string;
  bio?: string;
  photos: string[];
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
  latitude?: number;
  longitude?: number;
  location?: string;
  distance?: number; // Distance in kilometers from user's location
}

// Get all duos for the current user
export const getUserDuos = async (): Promise<Duo[]> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('duos')
    .select(`
      *,
      user1:user1_id(id, name, photos),
      user2:user2_id(id, name, photos)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching duos:', error);
    throw error;
  }

  return data || [];
};

// Find nearby duos within a specified radius
export const findNearbyDuos = async (
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10
): Promise<Duo[]> => {
  // Get current user's session
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Get all duos with location data
  const { data, error } = await supabase
    .from('duos')
    .select(`
      *,
      user1:user1_id(id, name, photos),
      user2:user2_id(id, name, photos)
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    console.error('Error fetching duos with location:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Filter out duos that belong to the current user
  const otherDuos = data.filter(
    duo => duo.user1_id !== userId && duo.user2_id !== userId
  );

  // Calculate distance and filter by radius
  // Using Haversine formula to calculate distance between two points on Earth
  const nearbyDuos = otherDuos.map(duo => {
    const distance = calculateDistance(
      latitude,
      longitude,
      duo.latitude!,
      duo.longitude!
    );
    
    return {
      ...duo,
      distance
    };
  })
  // Filter duos within the specified radius
  .filter(duo => duo.distance <= radiusKm)
  // Sort by distance (closest first)
  .sort((a, b) => a.distance - b.distance);

  return nearbyDuos;
};

// Calculate distance between two points using Haversine formula
// Returns distance in kilometers
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
}; 