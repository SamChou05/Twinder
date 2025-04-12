import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const SettingsContainer = styled.div`
  padding: 20px;
`;

const SettingsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
`;

const SettingTitle = styled.h3`
  margin-bottom: 10px;
`;

const LogoutButton = styled.button`
  background-color: var(--danger-color);
  margin-top: 20px;
  
  &:hover {
    background-color: #ff5252;
  }
`;

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <SettingsContainer>
      <h1>Settings</h1>
      
      <SettingsCard>
        <SettingItem>
          <SettingTitle>Notifications</SettingTitle>
          <label>
            <input type="checkbox" /> Enable push notifications
          </label>
        </SettingItem>
        
        <SettingItem>
          <SettingTitle>Account</SettingTitle>
          <button>Change Password</button>
        </SettingItem>
        
        <SettingItem>
          <SettingTitle>Privacy</SettingTitle>
          <label>
            <input type="checkbox" checked /> Show profile to others
          </label>
        </SettingItem>
        
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </SettingsCard>
    </SettingsContainer>
  );
};

export default Settings; 