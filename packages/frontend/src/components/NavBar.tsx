import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background-color: var(--card-background);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  margin: 0 auto;
`;

const NavLink = styled(Link)<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 15px;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--light-text)'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: var(--primary-color);
  }
`;

const NavIcon = styled.div`
  font-size: 24px;
  margin-bottom: 5px;
`;

const NavText = styled.span`
  font-size: 12px;
`;

interface NavBarProps {
  activePage: string;
}

const NavBar = ({ activePage }: NavBarProps) => {
  return (
    <Nav>
      <NavLinks>
        <NavLink to="/" active={activePage === 'home'}>
          <NavIcon>🏠</NavIcon>
          <NavText>Home</NavText>
        </NavLink>
        <NavLink to="/explore" active={activePage === 'explore'}>
          <NavIcon>👥</NavIcon>
          <NavText>Friends</NavText>
        </NavLink>
        <NavLink to="/duos" active={activePage === 'duos'}>
          <NavIcon>👥</NavIcon>
          <NavText>My Duos</NavText>
        </NavLink>
        <NavLink to="/nearby" active={activePage === 'nearby'}>
          <NavIcon>📍</NavIcon>
          <NavText>Nearby</NavText>
        </NavLink>
        <NavLink to="/chats" active={activePage === 'chats'}>
          <NavIcon>💬</NavIcon>
          <NavText>Chats</NavText>
        </NavLink>
        <NavLink to="/profile" active={activePage === 'profile'}>
          <NavIcon>👤</NavIcon>
          <NavText>Profile</NavText>
        </NavLink>
      </NavLinks>
    </Nav>
  );
};

export default NavBar; 