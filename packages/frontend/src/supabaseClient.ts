import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL is', supabaseUrl ? 'set' : 'not set');
  console.error('VITE_SUPABASE_ANON_KEY is', supabaseAnonKey ? 'set' : 'not set');
  console.error('Please create a .env.local file with these variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// For debugging purposes, mask the key
const maskedKey = supabaseAnonKey ? `${supabaseAnonKey.substring(0, 3)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 3)}` : 'not set';
console.log('Using anon key (masked):', maskedKey);

// Initialize Supabase client with realtime enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

// Test Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
  } else {
    console.log('Supabase connection successful, session:', data.session ? 'exists' : 'none');
  }
});

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  console.log('Attempting to sign in with email:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }
  console.log('Sign in successful');
  return data;
};

export const signUp = async (email: string, password: string, userData: any) => {
  console.log('Attempting to sign up with email:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData, // Store additional user data in user_metadata
    }
  });
  
  if (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }
  console.log('Sign up successful');
  return data;
};

export const signOut = async () => {
  console.log('Attempting to sign out');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }
  console.log('Sign out successful');
};

export const getCurrentUser = async () => {
  console.log('Getting current user');
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get user error:', error.message);
    throw error;
  }
  console.log('Got user:', data.user ? data.user.email : 'none');
  return data.user;
};

export const getSession = async () => {
  console.log('Getting session');
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error.message);
    throw error;
  }
  console.log('Got session:', data.session ? 'exists' : 'none');
  return data.session;
}; 