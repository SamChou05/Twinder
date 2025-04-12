import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from './NavBar';

const PageContainer = styled.div`
  padding-bottom: 80px; /* Space for the navbar */
  min-height: 100vh;
`;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Determine active page based on the current path
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/explore') || path.startsWith('/friends')) return 'explore';
    if (path.startsWith('/duos')) return 'duos';
    if (path.startsWith('/nearby')) return 'nearby';
    if (path.startsWith('/chats')) return 'chats';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  return (
    <PageContainer>
      {children}
      <NavBar activePage={getActivePage()} />
    </PageContainer>
  );
};

export default Layout; 