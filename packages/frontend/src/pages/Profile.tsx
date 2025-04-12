import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

const Container = styled.div`
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
`;

const ProfileAvatar = styled.div`
  height: 100px;
  width: 100px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  color: white;
  font-size: 2.5rem;
`;

const ProfileInfo = styled.div`
  padding: 20px;
  text-align: center;
`;

const ProfileName = styled.h2`
  margin-bottom: 10px;
`;

const ProfileEmail = styled.p`
  color: var(--light-text);
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 30px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #f44336;
`;

const Profile = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };
  
  // Get first letter of name for avatar from user metadata
  const getInitial = () => {
    const name = user?.user_metadata?.name || '';
    return name.charAt(0).toUpperCase() || '?';
  };

  // Get name from user metadata
  const getName = () => {
    return user?.user_metadata?.name || 'User';
  };

  return (
    <Container>
      <Header>
        <h1>Profile</h1>
      </Header>
      
      <ProfileCard>
        <ProfileAvatar>{getInitial()}</ProfileAvatar>
        <ProfileInfo>
          <ProfileName>{getName()}</ProfileName>
          <ProfileEmail>{user?.email || 'email@example.com'}</ProfileEmail>
        </ProfileInfo>
        
        <ButtonGroup>
          <Button>Edit Profile</Button>
          <Button>Change Password</Button>
          <LogoutButton onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </LogoutButton>
        </ButtonGroup>
      </ProfileCard>
    </Container>
  );
};

export default Profile; 