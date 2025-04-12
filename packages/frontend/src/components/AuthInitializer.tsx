import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { initializeAuth } from '../store/slices/authSlice';
import { supabase } from '../supabaseClient';
import Loader from './Loader';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { initialized, loading, error } = useSelector((state: RootState) => state.auth);

  console.log('AuthInitializer State:', { initialized, loading, error });

  useEffect(() => {
    // Initialize auth state
    if (!initialized && !loading) {
      console.log('Initializing auth...');
      dispatch(initializeAuth())
        .unwrap()
        .then(result => {
          console.log('Auth initialized successfully:', result);
        })
        .catch(err => {
          console.error('Auth initialization error:', err);
        });
    }

    // Listen for auth changes
    console.log('Setting up Supabase auth listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth state change:', event, session ? 'Session exists' : 'No session');
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-initialize auth to get the latest session and user data
          dispatch(initializeAuth());
        } else if (event === 'SIGNED_OUT') {
          // Re-initialize auth to clear session and user data
          dispatch(initializeAuth());
        }
      }
    );

    // Cleanup subscription
    return () => {
      console.log('Cleaning up Supabase auth listener...');
      subscription.unsubscribe();
    };
  }, [dispatch, initialized, loading]);

  // While initializing auth, show loader
  if (!initialized) {
    console.log('Auth not initialized yet, showing loader...');
    return <Loader />;
  }

  console.log('Auth initialized, rendering children...');
  return <>{children}</>;
};

export default AuthInitializer; 