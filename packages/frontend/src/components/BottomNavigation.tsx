import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  width: 25%;
  color: #999;
  text-decoration: none;
  font-size: 12px;

  &.active {
    color: var(--primary-color);
  }

  svg {
    margin-bottom: 4px;
    font-size: 24px;
  }
`;

const BottomNavigation = () => {
  return (
    <NavContainer>
      <NavItem to="/" end>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        </svg>
        Home
      </NavItem>
      <NavItem to="/friends">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"></path>
          <circle cx="17" cy="7" r="4"></circle>
          <path d="M15 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"></path>
        </svg>
        Friends
      </NavItem>
      <NavItem to="/duos">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="7" r="4"></circle>
          <circle cx="17" cy="8" r="3"></circle>
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"></path>
          <path d="M18 21v-1a2 2 0 00-2-2h-1"></path>
        </svg>
        Duos
      </NavItem>
      <NavItem to="/profile">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Profile
      </NavItem>
    </NavContainer>
  );
};

export default BottomNavigation; 