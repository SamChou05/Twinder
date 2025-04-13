import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RootState } from '../store';
import { supabase } from '../supabaseClient';

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

const CreateButton = styled(Link)`
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    opacity: 0.9;
  }
`;

const FriendsButton = styled(Link)`
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 15px;
  display: inline-block;
  
  &:hover {
    opacity: 0.9;
  }
`;

const DuoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DuoCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DuoCardContent = styled.div`
  padding: 20px;
  flex-grow: 1;
`;

const DuoTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const DuoBio = styled.p`
  color: var(--light-text);
  margin-bottom: 15px;
  font-size: 0.9rem;
`;

const DuoPartner = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const PartnerAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #666;
`;

const PartnerName = styled.span`
  font-size: 0.9rem;
`;

const DuoActions = styled.div`
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
  
  &:hover {
    text-decoration: underline;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #f44336;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
`;

const DuoPhotosPreview = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 15px;
  padding-bottom: 5px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 4px;
  }
`;

const DuoPhoto = styled.div<{ imageUrl: string }>`
  min-width: 80px;
  height: 80px;
  border-radius: 8px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  margin-right: 8px;
`;

const DuoPhotoPlaceholder = styled.div`
  min-width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 24px;
  margin-right: 8px;
`;

interface Duo {
  id: string;
  bio: string;
  user1_id: string;
  user2_id: string;
  user1: {
    id: string;
    name: string;
    email: string;
  };
  user2: {
    id: string;
    name: string;
    email: string;
  };
  photos?: string[];
}

interface Friend {
  id: string;
  name: string;
  email: string;
  photos?: string[];
  friendshipId?: string;
}

const DuoList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const [duos, setDuos] = useState<Duo[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasFriends, setHasFriends] = useState<boolean | null>(null);
  
  // Fetch friends to check if the user has any
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user) return;
        
        // Get current user ID
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;
        
        if (!currentUserId) {
          throw new Error('You must be logged in to view friends');
        }
        
        console.log('Checking if user has friends:', currentUserId);
        
        // Get accepted friendships where user is sender
        const { data: sentFriendships, error: sentError } = await supabase
          .from('friendships')
          .select('id')
          .eq('sender_id', currentUserId)
          .eq('status', 'accepted');
        
        if (sentError) {
          console.error('Error checking sent friendships:', sentError);
          return;
        }
        
        // Get accepted friendships where user is receiver
        const { data: receivedFriendships, error: receivedError } = await supabase
          .from('friendships')
          .select('id')
          .eq('receiver_id', currentUserId)
          .eq('status', 'accepted');
        
        if (receivedError) {
          console.error('Error checking received friendships:', receivedError);
          return;
        }
        
        const allFriendships = [
          ...(sentFriendships || []), 
          ...(receivedFriendships || [])
        ];
        
        console.log('Friend count:', allFriendships.length);
        setHasFriends(allFriendships.length > 0);
      } catch (err) {
        console.error('Error checking for friends:', err);
      }
    };
    
    fetchFriends();
  }, [user]);
  
  // Fetch duos once we confirm the user has friends
  useEffect(() => {
    const fetchDuos = async () => {
      try {
        if (!user || hasFriends === null) return;
        
        // Only fetch duos if the user has friends
        if (!hasFriends) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        // Fetch duos where the user is either user1 or user2
        const { data, error: duosError } = await supabase
          .from('duos')
          .select(`
            id,
            bio,
            title,
            user1_id,
            user2_id,
            user1:user1_id(id, name, email),
            user2:user2_id(id, name, email),
            photos
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        console.log('Raw duos data from database:', data);
        
        if (duosError) {
          console.error('Error fetching duos:', duosError);
          setError('Failed to load duos');
          return;
        }
        
        // Cast the response data to match the Duo interface
        const typedDuos = data?.map(duo => ({
          id: duo.id,
          bio: duo.bio,
          user1_id: duo.user1_id,
          user2_id: duo.user2_id,
          user1: (Array.isArray(duo.user1) ? duo.user1[0] : duo.user1) as {
            id: string;
            name: string;
            email: string;
          },
          user2: (Array.isArray(duo.user2) ? duo.user2[0] : duo.user2) as {
            id: string;
            name: string;
            email: string;
          },
          photos: duo.photos || []
        })) || [];
        
        setDuos(typedDuos);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDuos();
  }, [user, hasFriends]);
  
  const handleEdit = (duoId: string) => {
    console.log('Edit button clicked for duo ID:', duoId);
    console.log('Current user:', user?.id);
    console.log('Navigating to path:', `/duos/edit/${duoId}`);
    
    // Additional debugging
    const duo = duos.find(d => d.id === duoId);
    if (duo) {
      console.log('Duo data being edited:', {
        id: duo.id,
        bio: duo.bio,
        user1: duo.user1?.name,
        user2: duo.user2?.name
      });
    } else {
      console.error('Could not find duo with ID:', duoId);
    }
    
    navigate(`/duos/edit/${duoId}`);
  };
  
  const handleDelete = async (duoId: string) => {
    if (!window.confirm('Are you sure you want to delete this duo?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('duos')
        .delete()
        .eq('id', duoId);
      
      if (error) {
        console.error('Error deleting duo:', error);
        return;
      }
      
      // Update the local state to remove the deleted duo
      setDuos(duos.filter(duo => duo.id !== duoId));
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const getPartnerInfo = (duo: Duo) => {
    // Determine which user is the partner (not the current user)
    const partner = duo.user1_id === user?.id ? duo.user2 : duo.user1;
    
    return {
      name: partner.name,
      email: partner.email,
      initial: partner.name.charAt(0).toUpperCase()
    };
  };
  
  // Get the duo display name from the two users
  const getDuoName = (duo: Duo) => {
    const user1Name = duo.user1?.name?.split(' ')[0] || 'User 1';
    const user2Name = duo.user2?.name?.split(' ')[0] || 'User 2';
    return `${user1Name} & ${user2Name}`;
  };
  
  const handleViewDuoProfile = (duoId: string, e: React.MouseEvent) => {
    // Don't prevent propagation here, we want the click to work
    navigate(`/duo-profile/${duoId}`);
  };
  
  // Render based on state
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>My Duos</Title>
        </Header>
        <LoadingState>Loading...</LoadingState>
      </Container>
    );
  }
  
  // If user has no friends, show a message to add friends first
  if (hasFriends === false) {
    return (
      <Container>
        <Header>
          <Title>My Duos</Title>
        </Header>
        <EmptyState>
          <h2>You need friends to create duos!</h2>
          <p>Before creating a duo, you need to add friends to your profile.</p>
          <p>Go to the Friends page to find and add people you know.</p>
          <FriendsButton to="/friends">Find Friends</FriendsButton>
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>My Duos</Title>
        <CreateButton to="/duos/create">Create Duo</CreateButton>
      </Header>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {duos.length === 0 ? (
        <EmptyState>
          <h2>You don't have any duos yet</h2>
          <p>Create a duo with a friend to get started with matching!</p>
          <CreateButton to="/duos/create">Create Your First Duo</CreateButton>
        </EmptyState>
      ) : (
        <DuoGrid>
          {duos.map(duo => {
            const partner = getPartnerInfo(duo);
            
            return (
              <DuoCard 
                key={duo.id} 
                onClick={(e) => handleViewDuoProfile(duo.id, e)}
              >
                <DuoCardContent>
                  <DuoTitle>{getDuoName(duo)}</DuoTitle>
                  <DuoBio>{duo.bio || 'No bio yet'}</DuoBio>
                  
                  {/* Photos gallery */}
                  <DuoPhotosPreview>
                    {duo.photos && duo.photos.length > 0 ? (
                      duo.photos.map((photo, index) => (
                        <DuoPhoto key={index} imageUrl={photo} />
                      ))
                    ) : (
                      <DuoPhotoPlaceholder>+</DuoPhotoPlaceholder>
                    )}
                  </DuoPhotosPreview>
                  
                  <DuoPartner>
                    <PartnerAvatar>{partner.initial}</PartnerAvatar>
                    <PartnerName>With {partner.name}</PartnerName>
                  </DuoPartner>
                </DuoCardContent>
                
                <DuoActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to profile
                    handleEdit(duo.id);
                  }}>
                    Edit
                  </ActionButton>
                  <DeleteButton onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to profile
                    handleDelete(duo.id);
                  }}>
                    Delete
                  </DeleteButton>
                </DuoActions>
              </DuoCard>
            );
          })}
        </DuoGrid>
      )}
    </Container>
  );
};

export default DuoList; 