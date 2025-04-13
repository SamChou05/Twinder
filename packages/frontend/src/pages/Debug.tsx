import { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Subtitle = styled.h2`
  margin-top: 30px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #4985e9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  
  &:hover {
    background-color: #3a76d0;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 10px;
  width: 250px;
`;

const CodeBlock = styled.pre`
  background-color: #f4f4f4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 10px;
`;

// Add a new section for seeding test data with realistic locations
const SeedDataSection = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const SeedButton = styled.button`
  background-color: #9c27b0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #7b1fa2;
  }
`;

// Sample duo data with real locations
const sampleDuoData = [
  {
    title: "Alex & Jordan",
    bio: "Gaming enthusiasts looking for worthy opponents in FPS and strategy games.",
    photos: ["https://via.placeholder.com/400x300/FF4081/FFFFFF?text=Alex+and+Jordan"],
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    title: "Taylor & Morgan",
    bio: "Adventure seekers who love outdoor activities and board games.",
    photos: ["https://via.placeholder.com/400x300/3F51B5/FFFFFF?text=Taylor+and+Morgan"],
    location: "Seattle, WA",
    latitude: 47.6062,
    longitude: -122.3321
  },
  {
    title: "Jamie & Casey",
    bio: "Music lovers and casual gamers. We enjoy cooperative gameplay and puzzle solving.",
    photos: ["https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Jamie+and+Casey"],
    location: "Austin, TX",
    latitude: 30.2672,
    longitude: -97.7431
  },
  {
    title: "Riley & Quinn",
    bio: "Film buffs and RPG enthusiasts. Looking for other creative duos to hang out with.",
    photos: ["https://via.placeholder.com/400x300/FFC107/FFFFFF?text=Riley+and+Quinn"],
    location: "Chicago, IL",
    latitude: 41.8781,
    longitude: -87.6298
  },
  {
    title: "Skylar & Dakota",
    bio: "Tech geeks and coffee lovers. We're into coding, gaming, and trying new cafes.",
    photos: ["https://via.placeholder.com/400x300/009688/FFFFFF?text=Skylar+and+Dakota"],
    location: "Portland, OR",
    latitude: 45.5051,
    longitude: -122.6750
  }
];

const seedTestDuos = async () => {
  try {
    // First create some test users
    const users = [];
    
    for (let i = 1; i <= 10; i++) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: `test-user-${i}`,
          name: `Test User ${i}`,
          email: `testuser${i}@example.com`
        })
        .select()
        .single();
        
      if (userError) {
        console.error(`Error creating test user ${i}:`, userError);
        continue;
      }
      
      users.push(userData);
    }
    
    // Create duo profiles with location data
    for (let i = 0; i < sampleDuoData.length; i++) {
      const duoData = sampleDuoData[i];
      const user1Index = i * 2;
      const user2Index = i * 2 + 1;
      
      if (user1Index >= users.length || user2Index >= users.length) break;
      
      const { data: duoResult, error: duoError } = await supabase
        .from('duos')
        .insert({
          title: duoData.title,
          bio: duoData.bio,
          user1_id: users[user1Index].id,
          user2_id: users[user2Index].id,
          photos: duoData.photos,
          location: duoData.location,
          latitude: duoData.latitude,
          longitude: duoData.longitude
        })
        .select();
        
      if (duoError) {
        console.error(`Error creating test duo ${i}:`, duoError);
      } else {
        console.log(`Created test duo:`, duoResult);
      }
    }
    
    return { success: true, message: "Created test duo profiles with location data." };
  } catch (err: any) {
    console.error("Error seeding test data:", err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

const Debug = () => {
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      setResult({ success: !error, data, error });
    } catch (error) {
      setResult({ success: false, error });
    }
  };
  
  const checkEnvVars = () => {
    setResult({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'not set',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set (masked)' : 'not set'
    });
  };
  
  const handleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age: parseInt(age, 10)
          }
        }
      });
      setResult({ success: !error, data, error });
    } catch (error) {
      setResult({ success: false, error });
    }
  };
  
  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      setResult({ success: !error, data, error });
    } catch (error) {
      setResult({ success: false, error });
    }
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setResult({ success: !error, error });
    } catch (error) {
      setResult({ success: false, error });
    }
  };
  
  return (
    <Container>
      <Title>Supabase Debug Page</Title>
      
      <Card>
        <Subtitle>Environment Variables</Subtitle>
        <Button onClick={checkEnvVars}>Check Environment Variables</Button>
      </Card>
      
      <Card>
        <Subtitle>Supabase Connection</Subtitle>
        <Button onClick={checkSupabaseConnection}>Test Supabase Connection</Button>
      </Card>
      
      <Card>
        <Subtitle>Authentication</Subtitle>
        
        <div>
          <Input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div>
          <Input 
            type="text" 
            placeholder="Name (for signup)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input 
            type="number" 
            placeholder="Age (for signup)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        
        <div>
          <Button onClick={handleSignUp}>Sign Up</Button>
          <Button onClick={handleSignIn}>Sign In</Button>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </Card>
      
      {result && (
        <Card>
          <Subtitle>Result</Subtitle>
          <CodeBlock>{JSON.stringify(result, null, 2)}</CodeBlock>
        </Card>
      )}
      
      <SeedDataSection>
        <h3>Seed Test Data</h3>
        <p>Create sample duo profiles with realistic location data for testing.</p>
        <SeedButton onClick={async () => {
          const result = await seedTestDuos();
          alert(result.message);
        }}>
          Seed Test Duos
        </SeedButton>
      </SeedDataSection>
    </Container>
  );
};

export default Debug; 