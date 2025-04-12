import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { findNearbyDuos } from '../services/duoService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 20px;
`;

const LocationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const DuoCard = styled(Card)`
  display: flex;
  position: relative;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const DuoInfo = styled.div`
  flex: 1;
`;

const DuoPhoto = styled.div<{ imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 15px;
  background-color: ${props => props.imageUrl ? 'transparent' : '#e0e0e0'};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const DuoTitle = styled.h3`
  margin: 0 0 5px 0;
`;

const DuoBio = styled.p`
  margin: 0 0 10px 0;
  color: var(--light-text);
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const Distance = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color-dark, #0056b3);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const RangeSlider = styled.input`
  flex: 1;
`;

const RangeValue = styled.span`
  min-width: 35px;
  text-align: right;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--light-text);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--light-text);
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 20px;
`;

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
  distance?: number; // Distance in kilometers
}

const NearbyDuos = () => {
  const navigate = useNavigate();
  
  const [duos, setDuos] = useState<Duo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  
  const [radius, setRadius] = useState(10); // Default 10km radius
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingLocation(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got coordinates:', latitude, longitude);
        
        // Try to get address from coordinates using a reverse geocoding service
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          let locationName = 'Your Location';
          if (data && data.display_name) {
            // Extract city and country if available
            const addressParts = data.display_name.split(', ');
            if (addressParts.length >= 2) {
              locationName = `${addressParts[1]}, ${addressParts[addressParts.length - 1]}`;
            } else {
              locationName = data.display_name;
            }
          }
          
          setUserLocation({
            latitude,
            longitude,
            locationName
          });
          
          // Fetch nearby duos based on location
          await fetchNearbyDuos(latitude, longitude, radius);
        } catch (err) {
          console.error('Error getting location name:', err);
          setUserLocation({
            latitude,
            longitude,
            locationName: 'Your Location'
          });
          
          // Still fetch nearby duos even if we couldn't get location name
          await fetchNearbyDuos(latitude, longitude, radius);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permission to access location was denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('The request to get location timed out');
            break;
          default:
            setError('An unknown error occurred while getting location');
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  const fetchNearbyDuos = async (lat: number, lng: number, radiusKm: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const nearbyDuos = await findNearbyDuos(lat, lng, radiusKm);
      setDuos(nearbyDuos);
      
      if (nearbyDuos.length === 0) {
        setError(`No duos found within ${radiusKm}km of your location`);
      }
    } catch (err: any) {
      console.error('Error fetching nearby duos:', err);
      setError(err.message || 'Failed to find nearby duos');
    } finally {
      setLoading(false);
    }
  };
  
  // Update the duos list when radius changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyDuos(userLocation.latitude, userLocation.longitude, radius);
    }
  }, [radius]);
  
  const formatDistance = (distance?: number): string => {
    if (distance === undefined) return 'Unknown';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    
    return `${distance.toFixed(1)}km`;
  };
  
  const handleDuoClick = (duoId: string) => {
    navigate(`/duos/${duoId}`);
  };
  
  return (
    <Container>
      <Header>
        <h1>Nearby Duos</h1>
        <p>Find duos close to your location</p>
      </Header>
      
      <LocationCard>
        {userLocation ? (
          <>
            <div>
              <strong>Your Location:</strong> {userLocation.locationName}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                ({userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)})
              </div>
            </div>
            
            <FilterContainer>
              <label htmlFor="radius">Search Radius:</label>
              <RangeSlider 
                type="range" 
                id="radius"
                min="1" 
                max="50" 
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
              />
              <RangeValue>{radius}km</RangeValue>
            </FilterContainer>
            
            <Button 
              onClick={() => handleGetLocation()}
              disabled={isGettingLocation}
            >
              Refresh Location
            </Button>
          </>
        ) : (
          <div>
            <p>Allow location access to find duos nearby</p>
            <Button 
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? 'Getting location...' : 'Get My Location'}
            </Button>
          </div>
        )}
      </LocationCard>
      
      {error && <ErrorState>{error}</ErrorState>}
      
      {loading ? (
        <LoadingState>
          <p>Finding duos near you...</p>
        </LoadingState>
      ) : userLocation && duos.length > 0 ? (
        duos.map(duo => (
          <DuoCard key={duo.id} onClick={() => handleDuoClick(duo.id)}>
            <DuoPhoto imageUrl={duo.photos?.[0]} />
            <DuoInfo>
              <DuoTitle>{duo.title}</DuoTitle>
              <DuoBio>{duo.bio || 'No bio available'}</DuoBio>
              {duo.location && (
                <div style={{ fontSize: '14px' }}>📍 {duo.location}</div>
              )}
            </DuoInfo>
            {duo.distance !== undefined && (
              <Distance>{formatDistance(duo.distance)}</Distance>
            )}
          </DuoCard>
        ))
      ) : userLocation ? (
        <EmptyState>
          <p>No duos found within {radius}km of your location</p>
          <p>Try increasing the search radius or check back later</p>
        </EmptyState>
      ) : null}
    </Container>
  );
};

export default NearbyDuos; 