import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { supabase } from '../supabaseClient';
import { RootState } from '../store';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  &::before {
    content: '←';
    margin-right: 8px;
  }
`;

const ProfileCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const Photo = styled.div<{ src: string }>`
  height: 200px;
  border-radius: 8px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

const ProfileInfo = styled.div`
  padding: 20px;
`;

const ProfileTitle = styled.h1`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.8rem;
`;

const ProfileBio = styled.p`
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
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

const MembersSection = styled.div`
  margin-top: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 15px;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MemberAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #666;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  margin: 0 0 5px;
  font-size: 1rem;
`;

const MemberEmail = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--light-text);
`;

const ActionButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ErrorState = styled.div`
  padding: 40px;
  text-align: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #f44336;
`;

interface DuoProfileData {
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

const DuoProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DuoProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    const fetchDuoProfile = async () => {
      if (!id) {
        setError('No duo ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('duos')
          .select(`
            id, title, bio, photos, location, latitude, longitude, 
            user1_id, user2_id,
            user1:user1_id(id, name, email),
            user2:user2_id(id, name, email)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching duo profile:', error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        console.log('Duo profile data:', data);
        
        // Format the data to match our interface - handle user objects
        const formattedProfile: DuoProfileData = {
          id: data.id,
          title: data.title,
          bio: data.bio,
          photos: data.photos || [],
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          user1_id: data.user1_id,
          user2_id: data.user2_id,
          user1: Array.isArray(data.user1) ? data.user1[0] : data.user1,
          user2: Array.isArray(data.user2) ? data.user2[0] : data.user2
        };
        
        setProfile(formattedProfile);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchDuoProfile:', err);
        setError('Failed to load duo profile');
        setLoading(false);
      }
    };
    
    fetchDuoProfile();
  }, [id]);
  
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  const handleStartChat = async () => {
    if (!profile) return;
    
    try {
      // Get the current user's duo
      if (!user) return;
      
      const { data: userDuos, error: duosError } = await supabase
        .from('duos')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      
      if (duosError || !userDuos || userDuos.length === 0) {
        console.error('Error fetching user duos:', duosError);
        return;
      }
      
      const currentUserDuoId = userDuos[0].id;
      
      // Check if a chat room already exists between these duos
      const { data: existingRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`duo1_id.eq.${currentUserDuoId},duo2_id.eq.${profile.id}`)
        .or(`duo1_id.eq.${profile.id},duo2_id.eq.${currentUserDuoId}`)
        .maybeSingle();
      
      if (roomError) {
        console.error('Error checking for existing chat room:', roomError);
        return;
      }
      
      if (existingRoom) {
        // If a chat room already exists, navigate to it
        navigate(`/chat-room/${existingRoom.id}`);
        return;
      }
      
      // Get current duo details
      const { data: currentDuo, error: currentDuoError } = await supabase
        .from('duos')
        .select('*, user1:user1_id(name), user2:user2_id(name)')
        .eq('id', currentUserDuoId)
        .single();
      
      if (currentDuoError || !currentDuo) {
        console.error('Error fetching current duo details:', currentDuoError);
        return;
      }
      
      // Create a new chat room
      const roomName = `${currentDuo.title} & ${profile.title}`;
      const room = {
        duo1_id: currentUserDuoId,
        duo2_id: profile.id,
        name: roomName,
        photo: profile.photos?.[0] || null,
        participants: [
          { id: currentDuo.user1_id, name: currentDuo.user1.name },
          { id: currentDuo.user2_id, name: currentDuo.user2.name },
          { id: profile.user1_id, name: profile.user1?.name || 'User 1' },
          { id: profile.user2_id, name: profile.user2?.name || 'User 2' }
        ],
        created_at: new Date().toISOString(),
        last_message: '',
        last_message_time: new Date().toISOString()
      };
      
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert(room)
        .select('id')
        .single();
      
      if (createError || !newRoom) {
        console.error('Error creating chat room:', createError);
        return;
      }
      
      // Navigate to the new chat room
      navigate(`/chat-room/${newRoom.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };
  
  const handleViewUserProfile = (userId: string) => {
    navigate(`/user-profile/${userId}`);
  };
  
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleGoBack}>Back</BackButton>
        </Header>
        <LoadingState>
          <p>Loading duo profile...</p>
        </LoadingState>
      </Container>
    );
  }
  
  if (error || !profile) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleGoBack}>Back</BackButton>
        </Header>
        <ErrorState>
          <h2>Error</h2>
          <p>{error || 'Failed to load duo profile'}</p>
        </ErrorState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton onClick={handleGoBack}>Back to Matches</BackButton>
      </Header>
      
      <ProfileCard>
        <ProfileInfo>
          <ProfileTitle>{profile.title}</ProfileTitle>
          <ProfileBio>{profile.bio}</ProfileBio>
          
          {profile.location && (
            <LocationInfo>
              <LocationIcon>📍</LocationIcon>
              <LocationText>{profile.location}</LocationText>
            </LocationInfo>
          )}
          
          <ActionButton onClick={handleStartChat}>
            Message Duo
          </ActionButton>
        </ProfileInfo>
      </ProfileCard>
      
      {profile.photos && profile.photos.length > 0 && (
        <div>
          <SectionTitle>Photos</SectionTitle>
          <PhotoGrid>
            {profile.photos.map((photo, index) => (
              <Photo key={index} src={photo} />
            ))}
          </PhotoGrid>
        </div>
      )}
      
      <MembersSection>
        <SectionTitle>Members</SectionTitle>
        
        {profile.user1 && (
          <MemberCard onClick={() => handleViewUserProfile(profile.user1_id)}>
            <MemberAvatar>{profile.user1.name.charAt(0)}</MemberAvatar>
            <MemberInfo>
              <MemberName>{profile.user1.name}</MemberName>
              <MemberEmail>{profile.user1.email}</MemberEmail>
            </MemberInfo>
          </MemberCard>
        )}
        
        {profile.user2 && (
          <MemberCard onClick={() => handleViewUserProfile(profile.user2_id)}>
            <MemberAvatar>{profile.user2.name.charAt(0)}</MemberAvatar>
            <MemberInfo>
              <MemberName>{profile.user2.name}</MemberName>
              <MemberEmail>{profile.user2.email}</MemberEmail>
            </MemberInfo>
          </MemberCard>
        )}
      </MembersSection>
    </Container>
  );
};

export default DuoProfile; 