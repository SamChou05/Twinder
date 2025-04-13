import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #666;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  margin: 0 0 5px;
  font-size: 1.8rem;
`;

const ProfileEmail = styled.p`
  margin: 0;
  font-size: 1rem;
  color: var(--light-text);
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

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 30px 0 15px;
`;

const DuoCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DuoTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.1rem;
`;

const DuoDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color);
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  color: var(--light-text);
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

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  photos: string[];
  duos: {
    id: string;
    title: string;
    bio: string;
    photos: string[];
  }[];
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, email, photos')
          .eq('id', id)
          .single();
        
        if (userError) {
          console.error('Error fetching user profile:', userError);
          setError(userError.message);
          setLoading(false);
          return;
        }
        
        // Fetch duos where this user is either user1 or user2
        const { data: duosData, error: duosError } = await supabase
          .from('duos')
          .select('id, title, bio, photos')
          .or(`user1_id.eq.${id},user2_id.eq.${id}`);
        
        if (duosError) {
          console.error('Error fetching user duos:', duosError);
          // Not setting error here, as we'll still show the user profile
          // Just without duos
        }
        
        setProfile({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          photos: userData.photos || [],
          duos: duosData || []
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchUserProfile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);
  
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  const handleDuoClick = (duoId: string) => {
    navigate(`/duo-profile/${duoId}`);
  };
  
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleGoBack}>Back</BackButton>
        </Header>
        <LoadingState>
          <p>Loading user profile...</p>
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
          <p>{error || 'Failed to load user profile'}</p>
        </ErrorState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton onClick={handleGoBack}>Back</BackButton>
      </Header>
      
      <ProfileCard>
        <ProfileHeader>
          <ProfileAvatar>{profile.name.charAt(0)}</ProfileAvatar>
          <ProfileInfo>
            <ProfileName>{profile.name}</ProfileName>
            <ProfileEmail>{profile.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>
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
      
      <SectionTitle>Duos</SectionTitle>
      {profile.duos && profile.duos.length > 0 ? (
        <div>
          {profile.duos.map(duo => (
            <DuoCard key={duo.id} onClick={() => handleDuoClick(duo.id)}>
              <DuoTitle>{duo.title}</DuoTitle>
              <DuoDescription>{duo.bio}</DuoDescription>
            </DuoCard>
          ))}
        </div>
      ) : (
        <EmptyState>
          <p>This user is not part of any duos yet.</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default UserProfile; 