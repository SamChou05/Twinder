import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthInitializer from './components/AuthInitializer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Debug from './pages/Debug';

const App = () => {
  const { session, initialized, loading, error } = useSelector((state: RootState) => state.auth);

  console.log('Auth State:', { session, initialized, loading, error });

  // First-time debugging fallback - render a simplified version if we're having issues
  if (error) {
    console.error('Auth Error:', error);
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Authentication Error</h1>
        <p>There was an error with authentication: {error}</p>
        <p>Please check your console and Supabase configuration.</p>
        <p>Go to <a href="/debug">/debug</a> to troubleshoot Supabase connection.</p>
      </div>
    );
  }

  // Try a simple return for debugging
  return (
    <AuthInitializer>
      <Routes>
        {/* Debug route - accessible without authentication */}
        <Route path="/debug" element={<Debug />} />

        {/* Public routes */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!session ? <Register /> : <Navigate to="/" replace />} 
        />

        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Explore Page Coming Soon</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/duos" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>My Duos Page Coming Soon</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Chats Page Coming Soon</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home or login based on auth status */}
        <Route 
          path="*" 
          element={<Navigate to={session ? "/" : "/login"} replace />} 
        />
      </Routes>
    </AuthInitializer>
  );
};

export default App; 