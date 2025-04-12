import { useState, useEffect } from 'react';
import styled from 'styled-components';

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

// Mock duo profiles for swiping
const mockProfiles = [
  {
    id: '1',
    name: 'Team Rocket',
    bio: 'Prepare for trouble, make it double! We are gaming enthusiasts looking for worthy opponents.',
    imageUrl: 'https://via.placeholder.com/400x300/FF4081/FFFFFF?text=Team+Rocket'
  },
  {
    id: '2',
    name: 'Dynamic Duo',
    bio: 'Batman and Robin of the gaming world. We specialize in strategy games.',
    imageUrl: 'https://via.placeholder.com/400x300/3F51B5/FFFFFF?text=Dynamic+Duo'
  },
  {
    id: '3',
    name: 'Power Pair',
    bio: 'Two friends who love cooperative gameplay and puzzle solving.',
    imageUrl: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Power+Pair'
  }
];

const Home = () => {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentProfile, setCurrentProfile] = useState(0);
  const [hasProfiles, setHasProfiles] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  
  // Simulate loading profiles - in a real app this would be from API
  useEffect(() => {
    // For demo purposes, set hasProfiles to true after 1 second
    const timer = setTimeout(() => {
      setHasProfiles(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <HomeContainer>
      <Header>
        <h1>Twinder</h1>
        <p>Find your perfect duo match</p>
      </Header>
      
      {hasProfiles ? (
        <>
          <ProfileCard>
            {swipeDirection && <SwipeIndicator type={swipeDirection}>
              {swipeDirection === 'like' ? 'LIKE' : 'NOPE'}
            </SwipeIndicator>}
            
            <ProfileImage imageUrl={profiles[currentProfile].imageUrl} />
            <ProfileInfo>
              <ProfileName>{profiles[currentProfile].name}</ProfileName>
              <ProfileBio>
                {profiles[currentProfile].bio}
              </ProfileBio>
            </ProfileInfo>
          </ProfileCard>
          
          <ActionButtons>
            <ActionButton color="#ff4d4d" onClick={() => handleSwipe('dislike')}>✗</ActionButton>
            <ActionButton color="#4ecdc4" onClick={() => handleSwipe('like')}>♥</ActionButton>
          </ActionButtons>
        </>
      ) : (
        <NoContent>
          <h2>Create a Duo Profile</h2>
          <p>Team up with a friend to start matching with other duos</p>
          <button style={{ marginTop: '20px' }}>Get Started</button>
        </NoContent>
      )}
    </HomeContainer>
  );
};

export default Home; 