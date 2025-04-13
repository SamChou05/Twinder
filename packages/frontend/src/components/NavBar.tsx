import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../supabaseClient';

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
  position: relative;
  
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

const MatchCounter = styled.div`
  position: absolute;
  top: 0;
  right: 5px;
  background-color: #ff4081;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

interface NavBarProps {
  activePage: string;
}

const NavBar = ({ activePage }: NavBarProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [matchCount, setMatchCount] = useState(0);
  
  // Fetch match count for the current user
  useEffect(() => {
    const fetchMatchCount = async () => {
      if (!user) return;
      
      try {
        // First get all user's duos
        const { data: userDuos, error: duosError } = await supabase
          .from('duos')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (duosError || !userDuos || userDuos.length === 0) {
          console.log('No duos found for match counting');
          return;
        }
        
        const duoIds = userDuos.map(duo => duo.id);
        
        // Count matches where user's duos are involved
        const { data: matchData, error: matchError } = await supabase
          .from('matched_duos')
          .select('duo1_id, duo2_id')
          .or(
            duoIds.map(id => `duo1_id.eq.${id}`).join(',') + ',' +
            duoIds.map(id => `duo2_id.eq.${id}`).join(',')
          );
        
        if (matchError) {
          console.error('Error fetching match count:', matchError);
          return;
        }
        
        if (matchData) {
          setMatchCount(matchData.length);
        }
      } catch (err) {
        console.error('Error in fetchMatchCount:', err);
      }
    };
    
    fetchMatchCount();
    
    // Subscribe to new matches
    const matchSubscription = supabase
      .channel('matched_duos_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'matched_duos' 
      }, () => {
        // Refetch match count when a new match is created
        fetchMatchCount();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(matchSubscription);
    };
  }, [user]);
  
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
        <NavLink to="/matches" active={activePage === 'matches'}>
          <NavIcon>❤️</NavIcon>
          <NavText>Matches</NavText>
          {matchCount > 0 && <MatchCounter>{matchCount}</MatchCounter>}
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