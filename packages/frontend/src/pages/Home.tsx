import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { RootState } from '../store';
import { calculateDistance } from '../utils/locationUtils';

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const ProfileCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
`;

const ProfileImage = styled.div<{ imageUrl: string }>`
  height: 300px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const ProfileInfo = styled.div`
  padding: 20px;
`;

const ProfileName = styled.h2`
  margin-bottom: 10px;
`;

const ProfileBio = styled.p`
  color: var(--light-text);
  margin-bottom: 15px;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  color: var(--light-text);
  font-size: 14px;
`;

const LocationIcon = styled.span`
  margin-right: 8px;
  font-size: 18px;
`;

const LocationText = styled.span`
  font-weight: 500;
`;

const DistanceBadge = styled.span`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 3px 10px;
  margin-left: 10px;
  font-size: 12px;
  color: var(--secondary-color);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ color?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: ${props => props.color || 'var(--primary-color)'};
  border: none;
  cursor: pointer;
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
`;

const NoContent = styled.div`
  text-align: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 40px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SwipeIndicator = styled.div<{ type: 'like' | 'dislike' }>`
  position: absolute;
  top: 20px;
  right: ${props => props.type === 'like' ? '20px' : 'auto'};
  left: ${props => props.type === 'dislike' ? '20px' : 'auto'};
  transform: rotate(${props => props.type === 'like' ? '-15deg' : '15deg'});
  border: 4px solid ${props => props.type === 'like' ? '#4ecdc4' : '#ff4d4d'};
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.type === 'like' ? '#4ecdc4' : '#ff4d4d'};
  background-color: rgba(255, 255, 255, 0.8);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

// Extended mock duo profiles with location data
const mockProfiles = [
  {
    id: '1',
    title: 'Team Rocket',
    bio: 'Prepare for trouble, make it double! We are gaming enthusiasts looking for worthy opponents.',
    photos: ['https://via.placeholder.com/400x300/FF4081/FFFFFF?text=Team+Rocket'],
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: '2',
    title: 'Dynamic Duo',
    bio: 'Batman and Robin of the gaming world. We specialize in strategy games.',
    photos: ['https://via.placeholder.com/400x300/3F51B5/FFFFFF?text=Dynamic+Duo'],
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    id: '3',
    title: 'Power Pair',
    bio: 'Two friends who love cooperative gameplay and puzzle solving.',
    photos: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Power+Pair'],
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060
  }
];

interface DuoProfile {
  id: string;
  title: string;
  bio: string;
  photos: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  distance?: number | null;
}

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profiles, setProfiles] = useState<DuoProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude?: number, longitude?: number} | null>(null);
  
  // Fetch user's location from their profile
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('latitude, longitude')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user location:', error);
          return;
        }
        
        if (data) {
          console.log('User location:', data);
          setUserLocation(data);
        }
      } catch (err) {
        console.error('Error fetching user location:', err);
      }
    };
    
    fetchUserLocation();
  }, [user]);
  
  // Fetch duo profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      
      try {
        if (!user) {
          // If no user is authenticated, use mock data for preview
          const mockWithDistances = mockProfiles.map(profile => {
            const distance = calculateDistance(
              userLocation?.latitude,
              userLocation?.longitude,
              profile.latitude,
              profile.longitude
            );
            
            return {
              ...profile,
              distance
            };
          });
          
          setProfiles(mockWithDistances);
          setIsLoading(false);
          return;
        }
        
        // Fetch real profiles from Supabase
        console.log('Fetching duo profiles for user:', user.id);
        
        // Get duos where the current user is not a participant
        const { data: duoData, error: duoError } = await supabase
          .from('duos')
          .select('id, title, bio, photos, location, latitude, longitude, user1_id, user2_id')
          .not('user1_id', 'eq', user.id)
          .not('user2_id', 'eq', user.id);
        
        if (duoError) {
          console.error('Error fetching duo profiles:', duoError);
          setIsLoading(false);
          return;
        }
        
        console.log('Found duo profiles:', duoData?.length || 0);
        
        // Map the data and calculate distances
        const profilesWithDistance = duoData?.map(duo => {
          const distance = calculateDistance(
            userLocation?.latitude,
            userLocation?.longitude,
            duo.latitude,
            duo.longitude
          );
          
          return {
            ...duo,
            distance
          };
        }) || [];
        
        // If we have real profiles, use them; otherwise fall back to mock data
        if (profilesWithDistance.length > 0) {
          console.log('Using real profiles with distances:', profilesWithDistance);
          setProfiles(profilesWithDistance);
        } else {
          console.log('No real profiles found, using mock data');
          // Fall back to mock data if no profiles found
          const mockWithDistances = mockProfiles.map(profile => {
            const distance = calculateDistance(
              userLocation?.latitude,
              userLocation?.longitude,
              profile.latitude,
              profile.longitude
            );
            
            return {
              ...profile,
              distance
            };
          });
          
          setProfiles(mockWithDistances);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        // Fall back to mock data on error
        const mockWithDistances = mockProfiles.map(profile => {
          const distance = calculateDistance(
            userLocation?.latitude,
            userLocation?.longitude,
            profile.latitude,
            profile.longitude
          );
          
          return {
            ...profile,
            distance
          };
        });
        
        setProfiles(mockWithDistances);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userLocation) {
      fetchProfiles();
    }
  }, [userLocation, user]);

  const handleSwipe = (direction: 'like' | 'dislike') => {
    setSwipeDirection(direction);
    
    // Move to next profile after animation
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentProfile < profiles.length - 1) {
        setCurrentProfile(currentProfile + 1);
      } else {
        // Reset to the first profile for demo purposes
        setCurrentProfile(0);
      }
    }, 800);
  };

  if (isLoading) {
    return (
      <HomeContainer>
        <Header>
          <h1>Twinder</h1>
          <p>Find your perfect duo match</p>
        </Header>
        <LoadingState>Loading potential matches...</LoadingState>
      </HomeContainer>
    );
  }

  if (!profiles.length) {
    return (
      <HomeContainer>
        <Header>
          <h1>Twinder</h1>
          <p>Find your perfect duo match</p>
        </Header>
        <NoContent>
          <h2>No Matches Found</h2>
          <p>We couldn't find any duo matches for you at the moment. Check back later!</p>
        </NoContent>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Header>
        <h1>Twinder</h1>
        <p>Find your perfect duo match</p>
      </Header>
      
      <ProfileCard>
        {swipeDirection && <SwipeIndicator type={swipeDirection}>
          {swipeDirection === 'like' ? 'LIKE' : 'NOPE'}
        </SwipeIndicator>}
        
        <ProfileImage 
          imageUrl={profiles[currentProfile].photos?.[0] || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'} 
        />
        <ProfileInfo>
          <ProfileName>{profiles[currentProfile].title}</ProfileName>
          <ProfileBio>{profiles[currentProfile].bio}</ProfileBio>
          
          {profiles[currentProfile].location && (
            <LocationInfo>
              <LocationIcon>📍</LocationIcon>
              <LocationText>{profiles[currentProfile].location}</LocationText>
              {profiles[currentProfile].distance !== null && (
                <DistanceBadge>{profiles[currentProfile].distance} miles away</DistanceBadge>
              )}
            </LocationInfo>
          )}
        </ProfileInfo>
      </ProfileCard>
      
      <ActionButtons>
        <ActionButton color="#ff4d4d" onClick={() => handleSwipe('dislike')}>✗</ActionButton>
        <ActionButton color="#4ecdc4" onClick={() => handleSwipe('like')}>♥</ActionButton>
      </ActionButtons>
    </HomeContainer>
  );
};

export default Home; 