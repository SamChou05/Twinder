/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 Latitude of the first point in degrees
 * @param lon1 Longitude of the first point in degrees
 * @param lat2 Latitude of the second point in degrees
 * @param lon2 Longitude of the second point in degrees
 * @returns Distance in miles, rounded to one decimal place
 */
export const calculateDistance = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null => {
  // Return null if any coordinates are missing
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in miles
  const radius = 3958.8;
  
  // Calculate the distance and round to one decimal place
  const distance = Math.round(radius * c * 10) / 10;
  
  return distance;
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Formats a distance in a human-readable way
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance?: number): string => {
  if (distance === undefined) return 'Unknown';
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  
  if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  }
  
  return `${Math.round(distance)}km`;
}; 