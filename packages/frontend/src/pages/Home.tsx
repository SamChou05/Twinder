import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { RootState } from '../store';
import { calculateDistance } from '../utils/locationUtils';
import { likeDuo, getLikedDuos } from '../services/matchService';

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 20px;
`;

const DuoSelectorContainer = styled.div`
  margin-bottom: 30px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const DuoSelectorTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
`;

const DuoSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

const CreateDuoButton = styled.a`
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    opacity: 0.9;
  }
`;

const NotificationBanner = styled.div<{ type: 'success' | 'info' }>`
  background-color: ${props => props.type === 'success' ? '#4caf50' : '#2196f3'};
  color: white;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    margin-right: 10px;
    font-size: 20px;
  }
`;

// Add a match celebration overlay
const MatchCelebration = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const MatchText = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 20px 0;
  text-align: center;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const MatchProfiles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`;

const MatchProfile = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  margin: 0 10px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HeartIcon = styled.div`
  color: #ff4081;
  font-size: 40px;
  margin: 0 10px;
  animation: heartBeat 1.5s infinite;
  
  @keyframes heartBeat {
    0% { transform: scale(1); }
    25% { transform: scale(1.1); }
    40% { transform: scale(1); }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const ContinueButton = styled.button`
  background-color: #ff4081;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e91e63;
    transform: scale(1.05);
  }
`;

interface ConfettiProps {
  color: string;
  left: number;
  delay: number;
}

const Confetti = styled.div<ConfettiProps>`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${props => props.color};
  border-radius: 50%;
  animation: confettiFall 3s linear infinite;
  top: -10px;
  left: ${props => props.left}%;
  animation-delay: ${props => props.delay}s;
  
  @keyframes confettiFall {
    0% { 
      transform: translateY(0) rotate(0deg); 
      opacity: 1;
    }
    100% { 
      transform: translateY(100vh) rotate(720deg); 
      opacity: 0;
    }
  }
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

// These mock duos have already "liked" the user's duo
// When the user likes them back, it will create a match
const mockLikedYouDuos = [
  {
    id: 'mock-like-1',
    title: "Match Makers",
    bio: "We've already liked your duo! Like us back to test the match feature. We love board games and card games.",
    photos: ['https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Match+Makers'],
    location: "Boston, MA",
    latitude: 42.3601,
    longitude: -71.0589
  },
  {
    id: 'mock-like-2',
    title: "Test Match",
    bio: "This is a test duo that already likes your duo. Like us back to see the match animation!",
    photos: ['https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Test+Match'],
    location: "Denver, CO",
    latitude: 39.7392,
    longitude: -104.9903
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
  user1_id?: string;
  user2_id?: string;
}

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profiles, setProfiles] = useState<DuoProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude?: number, longitude?: number} | null>(null);
  
  // User's duos state
  const [userDuos, setUserDuos] = useState<DuoProfile[]>([]);
  const [selectedDuoId, setSelectedDuoId] = useState<string>('');
  
  // State for notifications after matches
  const [matchNotification, setMatchNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Add state for match celebration
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DuoProfile | null>(null);

  // Fetch user's duos
  useEffect(() => {
    const fetchUserDuos = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('duos')
          .select('id, title, bio, photos, location, latitude, longitude, user1_id, user2_id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (error) {
          console.error('Error fetching user duos:', error);
          return;
        }
        
        console.log('User duos:', data);
        
        if (data && data.length > 0) {
          setUserDuos(data);
          setSelectedDuoId(data[0].id); // Set the first duo as selected by default
        }
      } catch (err) {
        console.error('Error fetching user duos:', err);
      }
    };
    
    fetchUserDuos();
  }, [user]);
  
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
  
  // Simulate likes from other duos
  const setupTestLikes = async (duoId: string) => {
    if (!duoId) return;
    
    try {
      console.log('Setting up test likes for duo:', duoId);
      
      // For each mock duo that likes the user, create a duo_match record
      for (const mockDuo of mockLikedYouDuos) {
        const { data: existingLike, error: checkError } = await supabase
          .from('duo_matches')
          .select('id')
          .eq('liker_duo_id', mockDuo.id)
          .eq('liked_duo_id', duoId)
          .maybeSingle();
        
        // If there's no existing like, create one
        if (!existingLike && (!checkError || checkError.code === 'PGRST116')) {
          const { error } = await supabase
            .from('duo_matches')
            .insert({
              liker_duo_id: mockDuo.id,
              liked_duo_id: duoId
            });
          
          if (error) {
            console.error(`Error creating test like from ${mockDuo.title}:`, error);
          } else {
            console.log(`Created test like from ${mockDuo.title} to your duo`);
          }
        }
      }
    } catch (err) {
      console.error('Error setting up test likes:', err);
    }
  };
  
  // Add effect to set up test likes when duo is selected
  useEffect(() => {
    if (selectedDuoId && user) {
      setupTestLikes(selectedDuoId);
    }
  }, [selectedDuoId, user]);

  // Fetch duo profiles that can be matched with
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      
      try {
        if (!user || !selectedDuoId) {
          // If no user is authenticated or no duo is selected, use mock data for preview
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
        
        // Fetch potential matches for the selected duo
        console.log('Fetching potential matches for duo:', selectedDuoId);
        
        // Get duos the user has already liked to filter them out
        const { likedDuoIds, error: likedError } = await getLikedDuos(selectedDuoId);
        
        if (likedError) {
          console.error('Error fetching liked duos:', likedError);
        }
        
        // Get duos where neither the current user nor the partner of the selected duo are participants
        const selectedDuo = userDuos.find(duo => duo.id === selectedDuoId);
        if (!selectedDuo) {
          console.error('Selected duo not found in user duos');
          setIsLoading(false);
          return;
        }
        
        // DEBUGGING: Get all duos in the system to see what's available
        const { data: allDuos, error: allDuosError } = await supabase
          .from('duos')
          .select('id, title, bio, photos, location, latitude, longitude, user1_id, user2_id');
        
        if (allDuosError) {
          console.error('Error fetching all duos:', allDuosError);
        } else {
          console.log('All duos in the system:', allDuos);
        }
        
        // SIMPLIFIED QUERY: Just filter out the user's own duo and already liked duos
        const { data: duoData, error: duoError } = await supabase
          .from('duos')
          .select('id, title, bio, photos, location, latitude, longitude, user1_id, user2_id')
          .not('id', 'eq', selectedDuoId); // Don't match with self
        
        if (duoError) {
          console.error('Error fetching duo profiles:', duoError);
          setIsLoading(false);
          return;
        }
        
        console.log('Found duo profiles (before filtering):', duoData?.length || 0, duoData);
        
        // Manual filtering to ensure we don't miss any duos
        let filteredDuos = duoData || [];
        
        // Filter out duos that have been liked already
        if (likedDuoIds && likedDuoIds.length > 0) {
          filteredDuos = filteredDuos.filter(duo => !likedDuoIds.includes(duo.id));
          console.log('After filtering liked duos:', filteredDuos.length);
        }
        
        // Map the data and calculate distances
        const profilesWithDistance = filteredDuos.map(duo => {
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
        });
        
        console.log('Final profiles with distance:', profilesWithDistance);
        
        // Check if we have real profiles
        if (profilesWithDistance.length > 0) {
          console.log('Using real profiles with distances:', profilesWithDistance);
          
          // Add our mock "liked you" duos to the front of the deck
          // This ensures users can easily test the match feature
          const mockLikedYouWithDistance = mockLikedYouDuos.map(duo => {
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
          });
          
          // Combine mock duos that like the user with real profiles
          setProfiles([...mockLikedYouWithDistance, ...profilesWithDistance]);
        } else {
          console.log('No real profiles found, using mock data');
          // Add our mock "liked you" duos to the mock data
          const allMockProfiles = [...mockLikedYouDuos, ...mockProfiles];
          
          // Calculate distances for all mock profiles
          const mockWithDistances = allMockProfiles.map(profile => {
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
        const allMockProfiles = [...mockLikedYouDuos, ...mockProfiles];
        const mockWithDistances = allMockProfiles.map(profile => {
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
    
    if (userLocation && (selectedDuoId || !user)) {
      fetchProfiles();
    }
  }, [userLocation, user, selectedDuoId, userDuos]);

  // Create a match record in the database
  const createMatchRecord = async (duo1Id: string, duo2Id: string) => {
    try {
      console.log(`Creating match record between duos ${duo1Id} and ${duo2Id}`);
      
      // First ensure both duos have liked each other in duo_matches table
      // This is needed because the matched_duos view relies on mutual likes existing
      
      // Check if duo1 already liked duo2
      const { data: existingLike1, error: checkError1 } = await supabase
        .from('duo_matches')
        .select('id')
        .eq('liker_duo_id', duo1Id)
        .eq('liked_duo_id', duo2Id)
        .maybeSingle();
      
      // Check if duo2 already liked duo1
      const { data: existingLike2, error: checkError2 } = await supabase
        .from('duo_matches')
        .select('id')
        .eq('liker_duo_id', duo2Id)
        .eq('liked_duo_id', duo1Id)
        .maybeSingle();
      
      // Create duo1 -> duo2 like if it doesn't exist
      if (!existingLike1) {
        const { error: insertError1 } = await supabase
          .from('duo_matches')
          .insert({
            liker_duo_id: duo1Id,
            liked_duo_id: duo2Id
          });
          
        if (insertError1) {
          console.error('Error creating first like for match:', insertError1);
        } else {
          console.log(`Created like from ${duo1Id} to ${duo2Id}`);
        }
      }
      
      // Create duo2 -> duo1 like if it doesn't exist
      if (!existingLike2) {
        const { error: insertError2 } = await supabase
          .from('duo_matches')
          .insert({
            liker_duo_id: duo2Id,
            liked_duo_id: duo1Id
          });
          
        if (insertError2) {
          console.error('Error creating second like for match:', insertError2);
        } else {
          console.log(`Created like from ${duo2Id} to ${duo1Id}`);
        }
      }
      
      // The matched_duos view should now automatically have the match
      console.log('Match should now be visible in the Matches page');
      
      return true;
    } catch (err) {
      console.error('Error creating match record:', err);
      return false;
    }
  };

  const handleSwipe = async (direction: 'like' | 'dislike') => {
    setSwipeDirection(direction);
    
    // If it's a like, record it in the database
    if (direction === 'like' && selectedDuoId && profiles.length > 0) {
      const likedDuoId = profiles[currentProfile].id;
      
      try {
        // Check if this is one of our mock duos that should trigger a match
        const isMockMatchingDuo = mockLikedYouDuos.some(mockDuo => mockDuo.id === likedDuoId);
        
        if (isMockMatchingDuo) {
          console.log('🎯 Liked a mock duo that should trigger a match:', profiles[currentProfile].title);
          
          // For mock duos, create an actual match record in the database
          // This ensures the match appears on the Matches page
          const matchCreated = await createMatchRecord(selectedDuoId, likedDuoId);
          
          // Set the matched profile
          setMatchedProfile(profiles[currentProfile]);
          
          // Show the celebration overlay
          setShowMatchCelebration(true);
          
          // Also set the notification for when the celebration is closed
          setMatchNotification({
            show: true,
            message: `It's a match! You matched with ${profiles[currentProfile].title}!`,
            type: 'success'
          });
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setMatchNotification({
              show: false,
              message: '',
              type: 'success'
            });
          }, 5000);
          
          console.log(`🎉 Match celebration triggered for: ${profiles[currentProfile].title}, DB record created: ${matchCreated}`);
        } else {
          // For regular duos, proceed with the normal API call
          console.log('👍 Liking a regular duo:', likedDuoId);
          const result = await likeDuo(selectedDuoId, likedDuoId);
          
          console.log('Like result:', result);
          
          // If this created a match, show a notification
          if (result.isMatch) {
            // Set the matched profile
            setMatchedProfile(profiles[currentProfile]);
            
            // Show the celebration overlay
            setShowMatchCelebration(true);
            
            // Also set the notification for when the celebration is closed
            setMatchNotification({
              show: true,
              message: `It's a match! You matched with ${profiles[currentProfile].title}!`,
              type: 'success'
            });
            
            // Hide notification after 5 seconds
            setTimeout(() => {
              setMatchNotification({
                show: false,
                message: '',
                type: 'success'
              });
            }, 5000);
          }
        }
      } catch (err) {
        console.error('Error recording like:', err);
      }
    }
    
    // Move to next profile after animation
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentProfile < profiles.length - 1) {
        setCurrentProfile(currentProfile + 1);
      } else {
        // If we've reached the end of available profiles
        if (profiles.length > 0) {
          setMatchNotification({
            show: true,
            message: "You've seen all available matches for now. Check back later!",
            type: 'info'
          });
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setMatchNotification({
              show: false,
              message: '',
              type: 'info'
            });
          }, 5000);
        }
        
        // Reset to the first profile for demo purposes
        setCurrentProfile(0);
      }
    }, 800);
  };

  // Handle selecting a different duo for swiping
  const handleDuoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDuoId(e.target.value);
    setCurrentProfile(0); // Reset to first profile when changing duos
  };

  // Function to handle closing the match celebration
  const handleCloseCelebration = () => {
    setShowMatchCelebration(false);
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

  // Show a message if the user has no duos
  if (user && userDuos.length === 0) {
    return (
      <HomeContainer>
        <Header>
          <h1>Twinder</h1>
          <p>Find your perfect duo match</p>
        </Header>
        <NoContent>
          <h2>Create a Duo First</h2>
          <p>You need to create a duo with a friend before you can start matching with others.</p>
          <CreateDuoButton href="/duos/create">Create Your First Duo</CreateDuoButton>
        </NoContent>
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
        
        {user && (
          <DuoSelectorContainer>
            <DuoSelectorTitle>Select a duo to match with:</DuoSelectorTitle>
            <DuoSelect value={selectedDuoId} onChange={handleDuoChange}>
              {userDuos.map(duo => (
                <option key={duo.id} value={duo.id}>{duo.title}</option>
              ))}
            </DuoSelect>
          </DuoSelectorContainer>
        )}
        
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
      
      {user && (
        <DuoSelectorContainer>
          <DuoSelectorTitle>Select a duo to match with:</DuoSelectorTitle>
          <DuoSelect value={selectedDuoId} onChange={handleDuoChange}>
            {userDuos.map(duo => (
              <option key={duo.id} value={duo.id}>{duo.title}</option>
            ))}
          </DuoSelect>
        </DuoSelectorContainer>
      )}
      
      {matchNotification.show && (
        <NotificationBanner type={matchNotification.type}>
          <span>{matchNotification.type === 'success' ? '🎉' : 'ℹ️'}</span>
          {matchNotification.message}
        </NotificationBanner>
      )}
      
      {/* Add celebration overlay when there's a match */}
      {showMatchCelebration && matchedProfile && (
        <MatchCelebration>
          {/* Add confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Confetti 
              key={i}
              color={['#ff4081', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'][i % 5]}
              left={Math.random() * 100}
              delay={Math.random() * 2}
            />
          ))}
          
          <MatchText>It's a Match! 🎉</MatchText>
          
          <MatchProfiles>
            <MatchProfile>
              <img 
                src={userDuos.find(d => d.id === selectedDuoId)?.photos?.[0] || 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Your+Duo'} 
                alt="Your duo" 
              />
            </MatchProfile>
            
            <HeartIcon>❤️</HeartIcon>
            
            <MatchProfile>
              <img 
                src={matchedProfile.photos?.[0] || 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Matched+Duo'} 
                alt="Matched duo" 
              />
            </MatchProfile>
          </MatchProfiles>
          
          <p style={{ color: 'white', textAlign: 'center', maxWidth: '80%', margin: '0 auto' }}>
            You and {matchedProfile.title} have liked each other. Start chatting now!
          </p>
          
          <ContinueButton onClick={handleCloseCelebration}>
            Continue Swiping
          </ContinueButton>
        </MatchCelebration>
      )}
      
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
        <ActionButton 
          color="#ff4d4d" 
          onClick={() => handleSwipe('dislike')}
          disabled={!selectedDuoId && !!user}
        >
          ✗
        </ActionButton>
        <ActionButton 
          color="#4ecdc4" 
          onClick={() => handleSwipe('like')}
          disabled={!selectedDuoId && !!user}
        >
          ♥
        </ActionButton>
      </ActionButtons>
    </HomeContainer>
  );
};

export default Home; 