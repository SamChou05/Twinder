import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { supabase } from '../supabaseClient';
import { getMatches, DuoMatch } from '../services/matchService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h1`
  margin: 0;
`;

const SubTitle = styled.h2`
  margin: 10px 0;
  color: var(--primary-color);
  font-size: 1.2rem;
  text-align: center;
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

const CreateDuoButton = styled(Link)`
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

const FindMatchesButton = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  
  &:hover {
    opacity: 0.9;
  }
`;

const MatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MatchCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const MatchImage = styled.div<{ imageUrl: string }>`
  height: 200px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const MatchContent = styled.div`
  padding: 20px;
  flex-grow: 1;
`;

const MatchTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const MatchBio = styled.p`
  color: var(--light-text);
  margin-bottom: 15px;
  font-size: 0.9rem;
`;

const MatchDate = styled.div`
  font-size: 0.8rem;
  color: var(--light-text);
  margin-top: 15px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '🎉';
    margin-right: 5px;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
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

const MatchActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding: 15px 20px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &::before {
    margin-right: 5px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const MessageButton = styled(ActionButton)`
  &::before {
    content: '💬';
  }
`;

const ViewProfileButton = styled(ActionButton)`
  &::before {
    content: '👁️';
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  margin-bottom: 20px;
  font-size: 1.1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Spinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface DuoProfile {
  id: string;
  title: string;
  bio: string;
  photos: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  user1_id: string;
  user2_id: string;
}

const Matches = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [userDuos, setUserDuos] = useState<DuoProfile[]>([]);
  const [selectedDuoId, setSelectedDuoId] = useState<string>('');
  const [matches, setMatches] = useState<DuoMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Fetch matches for the selected duo
  useEffect(() => {
    const fetchMatches = async () => {
      if (!selectedDuoId) {
        setMatches([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { matches, error } = await getMatches(selectedDuoId);
        
        if (error) {
          console.error('Error fetching matches:', error);
          setMatches([]);
          setIsLoading(false);
          return;
        }
        
        console.log('Matches for duo:', matches);
        setMatches(matches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
    
    // Subscribe to match changes
    const matchSubscription = supabase
      .channel('matches_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matched_duos',
        filter: `duo1_id=eq.${selectedDuoId}` 
      }, () => {
        fetchMatches();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matched_duos',
        filter: `duo2_id=eq.${selectedDuoId}`
      }, () => {
        fetchMatches();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(matchSubscription);
    };
  }, [selectedDuoId]);
  
  // Handle selecting a different duo
  const handleDuoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDuoId(e.target.value);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get the matched duo (not the user's duo)
  const getMatchedDuo = (match: DuoMatch) => {
    return match.duo1_id === selectedDuoId ? match.duo2 : match.duo1;
  };
  
  // Handle starting a chat with a match
  const handleStartChat = (matchedDuo: DuoProfile) => {
    // For now, just navigate to chats page
    // In the future, this would create or open a specific chat
    navigate('/chats');
  };
  
  // Handle viewing a duo's profile
  const handleViewProfile = (matchedDuo: DuoProfile) => {
    navigate(`/duo-profile/${matchedDuo.id}`);
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Your Matches</Title>
        </Header>
        <LoadingState>
          <Spinner />
          <p>Loading your matches...</p>
        </LoadingState>
      </Container>
    );
  }

  // Show message if user has no duos
  if (user && userDuos.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Your Matches</Title>
        </Header>
        <EmptyState>
          <EmptyStateIcon>👥</EmptyStateIcon>
          <h2>Create a Duo First</h2>
          <EmptyStateText>
            You need to create a duo with a friend before you can see matches.
          </EmptyStateText>
          <CreateDuoButton to="/duos/create">Create Your First Duo</CreateDuoButton>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Matches</Title>
      </Header>
      
      {user && userDuos.length > 0 && (
        <DuoSelectorContainer>
          <DuoSelectorTitle>Select a duo to view matches:</DuoSelectorTitle>
          <DuoSelect value={selectedDuoId} onChange={handleDuoChange}>
            {userDuos.map(duo => (
              <option key={duo.id} value={duo.id}>{duo.title}</option>
            ))}
          </DuoSelect>
        </DuoSelectorContainer>
      )}
      
      {matches.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>❤️</EmptyStateIcon>
          <h2>No Matches Yet</h2>
          <EmptyStateText>
            You haven't matched with any duos yet. Start swiping to find matches!
          </EmptyStateText>
          <FindMatchesButton to="/">Find Matches</FindMatchesButton>
        </EmptyState>
      ) : (
        <>
          <SubTitle>You have {matches.length} match{matches.length !== 1 ? 'es' : ''}!</SubTitle>
          <MatchGrid>
            {matches.map(match => {
              const matchedDuo = getMatchedDuo(match);
              if (!matchedDuo) return null;
              
              return (
                <MatchCard key={match.duo1_id + match.duo2_id}>
                  <MatchImage imageUrl={matchedDuo.photos?.[0] || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'} />
                  <MatchContent>
                    <MatchTitle>{matchedDuo.title}</MatchTitle>
                    <MatchBio>{matchedDuo.bio}</MatchBio>
                    
                    {matchedDuo.location && (
                      <LocationInfo>
                        <LocationIcon>📍</LocationIcon>
                        <LocationText>{matchedDuo.location}</LocationText>
                      </LocationInfo>
                    )}
                    
                    <MatchDate>Matched on {formatDate(match.matched_at)}</MatchDate>
                  </MatchContent>
                  
                  <MatchActions>
                    <MessageButton onClick={() => handleStartChat(matchedDuo)}>
                      Message
                    </MessageButton>
                    <ViewProfileButton onClick={() => handleViewProfile(matchedDuo)}>
                      View Profile
                    </ViewProfileButton>
                  </MatchActions>
                </MatchCard>
              );
            })}
          </MatchGrid>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <FindMatchesButton to="/">Find More Matches</FindMatchesButton>
          </div>
        </>
      )}
    </Container>
  );
};

export default Matches; 