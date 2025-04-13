import { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { v4 as uuidv4 } from 'uuid';

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
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

const SeedButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 10px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const DebugButton = styled.button`
  background-color: #2196F3;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 10px;
  margin-right: 10px;
  
  &:hover {
    opacity: 0.9;
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
      // Generate a proper UUID for each user instead of using a string ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          // Don't specify ID field - let Supabase generate a valid UUID automatically
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
    
    // Make sure we have at least some users
    if (users.length === 0) {
      return { success: false, message: "Failed to create any test users. Check Supabase permissions." };
    }
    
    // Create duo profiles with location data
    let createdDuos = 0;
    for (let i = 0; i < sampleDuoData.length; i++) {
      const duoData = sampleDuoData[i];
      // Make sure we don't run out of users
      if (users.length < 2) {
        console.error("Not enough users were created to form duos");
        break;
      }
      
      // Use the first two available users for each duo
      const user1 = users.shift();
      const user2 = users.shift();
      
      if (!user1 || !user2) break;
      
      const { data: duoResult, error: duoError } = await supabase
        .from('duos')
        .insert({
          title: duoData.title,
          bio: duoData.bio,
          user1_id: user1.id,
          user2_id: user2.id,
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
        createdDuos++;
      }
    }
    
    if (createdDuos === 0) {
      return { success: false, message: "Failed to create any test duos. Check Supabase permissions." };
    }
    
    return { success: true, message: `Created ${createdDuos} test duo profiles with location data.` };
  } catch (err: any) {
    console.error("Error seeding test data:", err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

const Debug = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [checkResult, setCheckResult] = useState('Click to check Supabase connection');
  const [seedResult, setSeedResult] = useState('');
  
  const seedLikesToUserDuo = async () => {
    try {
      if (!user) {
        return { error: 'User not logged in', message: 'User not logged in' };
      }

      // Fetch user's duos
      const { data: userDuos, error: userDuosError } = await supabase
        .from('duos')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (userDuosError) throw userDuosError;
      if (!userDuos || userDuos.length === 0) {
        return { error: 'No duos found for this user', message: 'No duos found for this user' };
      }

      // Fetch other duos that are not the user's
      const { data: otherDuos, error: otherDuosError } = await supabase
        .from('duos')
        .select('*')
        .not('id', 'in', `(${userDuos.map(d => d.id).join(',')})`);

      if (otherDuosError || !otherDuos || otherDuos.length === 0) {
        console.error('Error fetching other duos:', otherDuosError);
        return { 
          error: otherDuosError ? otherDuosError.message : "No other duos found to create likes.",
          message: otherDuosError ? otherDuosError.message : "No other duos found to create likes."
        };
      }
      
      // For each of the user's duos, create likes from random other duos
      const results = [];
      for (const userDuo of userDuos) {
        // Randomly select up to 3 other duos to like the user's duo
        const selectedDuos = [];
        const duoCount = Math.min(3, otherDuos.length);
        
        for (let i = 0; i < duoCount; i++) {
          const randomIndex = Math.floor(Math.random() * otherDuos.length);
          selectedDuos.push(otherDuos.splice(randomIndex, 1)[0]);
        }
        
        // Create likes from these duos to the user's duo
        for (const otherDuo of selectedDuos) {
          const { data, error } = await supabase
            .from('duo_matches')
            .insert({
              liker_duo_id: otherDuo.id,
              liked_duo_id: userDuo.id
            })
            .select()
            .single();
          
          if (error) {
            if (error.code === '23505') {
              // Already liked, ignore the unique constraint violation
              results.push(`${otherDuo.title} already liked ${userDuo.title}`);
            } else {
              console.error(`Error creating like from ${otherDuo.title} to ${userDuo.title}:`, error);
              results.push(`Error: ${otherDuo.title} failed to like ${userDuo.title}: ${error.message}`);
            }
          } else {
            results.push(`${otherDuo.title} now likes ${userDuo.title}`);
          }
        }
      }
      
      return { 
        success: true, 
        message: `Created ${results.length} likes to your duos. Now when you like these duos back, you'll get a match!`,
        details: results.join('\n')
      };
    } catch (error) {
      console.error('Error seeding likes:', error);
      return { error: 'Failed to seed likes', message: 'Failed to seed likes' };
    }
  };
  
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
  
  // Add a section for seeding likes
  const handleSeedLikes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSeedResult('Seeding likes...');
      const result = await seedLikesToUserDuo();
      
      if (result.error) {
        setSeedResult(`Error: ${result.message}`);
      } else {
        // Show both message and details if available
        setSeedResult(result.details ? `${result.message}\n\nDetails:\n${result.details}` : result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSeedResult(`Error: ${error.message}`);
      } else {
        setSeedResult('An unknown error occurred');
      }
    }
  };
  
  // Diagnose issues with duos not seeing each other
  const diagnoseSwipingIssues = async () => {
    setResult({ message: "Diagnosing why duos can't see each other..." });
    
    try {
      // 1. Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setResult({ error: "Not authenticated. Please sign in first." });
        return;
      }
      
      const userId = session.session.user.id;
      setResult({ message: `Checking for user: ${userId}` });
      
      // 2. Get user's duos
      const { data: userDuos, error: userDuosError } = await supabase
        .from('duos')
        .select('id, title, user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      
      if (userDuosError) {
        setResult({ error: `Error fetching user duos: ${userDuosError.message}` });
        return;
      }
      
      if (!userDuos || userDuos.length === 0) {
        setResult({ error: "You don't have any duos created yet. Create a duo first." });
        return;
      }
      
      // 3. Get all other duos in the system
      const { data: allDuos, error: allDuosError } = await supabase
        .from('duos')
        .select('id, title, user1_id, user2_id');
      
      if (allDuosError) {
        setResult({ error: `Error fetching all duos: ${allDuosError.message}` });
        return;
      }
      
      // 4. Filter out the user's own duos
      const otherDuos = allDuos.filter(duo => 
        !userDuos.some(userDuo => userDuo.id === duo.id)
      );
      
      // 5. Check Row Level Security (RLS) by trying to read other duos
      const testDuoId = otherDuos.length > 0 ? otherDuos[0].id : null;
      let rlsStatus = "No other duos to test RLS with";
      
      if (testDuoId) {
        const { data: testRead, error: testReadError } = await supabase
          .from('duos')
          .select('*')
          .eq('id', testDuoId)
          .single();
          
        rlsStatus = testReadError 
          ? `RLS issue: ${testReadError.message}` 
          : "RLS is correctly configured for reading duos";
      }
      
      // 6. For the first user duo, check what it can see
      const testUserDuo = userDuos[0];
      const { data: visibleDuos, error: visibleDuosError } = await supabase
        .from('duos')
        .select('id, title')
        .not('id', 'eq', testUserDuo.id);
      
      const visibilityStatus = visibleDuosError
        ? `Error checking visibility: ${visibleDuosError.message}`
        : `Duo ${testUserDuo.title} (${testUserDuo.id}) can see ${visibleDuos?.length || 0} other duos`;
        
      // Set the complete diagnostic results
      setResult({
        diagnosticComplete: true,
        userId,
        userDuos,
        otherDuosCount: otherDuos.length,
        rlsStatus,
        visibilityStatus,
        recommendations: [
          "1. Ensure all duos have title, bio, and at least one photo",
          "2. Verify Row Level Security (RLS) policies are correctly set up",
          "3. Check that duos have not already liked each other",
          "4. Try refreshing the Home page to trigger a new fetch"
        ]
      });
      
    } catch (err) {
      setResult({ 
        error: 'Diagnostic failed', 
        details: err instanceof Error ? err.message : String(err) 
      });
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
        <h3>Troubleshoot Duo Visibility</h3>
        <p>Diagnose why duos can't see each other in the swiping interface.</p>
        <div>
          <DebugButton onClick={diagnoseSwipingIssues}>
            Diagnose Swiping Issues
          </DebugButton>
        </div>
      </SeedDataSection>
      
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
      
      <SeedDataSection>
        <h3>Seed Likes to Your Duos</h3>
        <p>Create likes from other duos to your duos. This will allow you to form matches when you like them back.</p>
        <SeedButton onClick={handleSeedLikes}>
          Seed Likes to My Duos
        </SeedButton>
      </SeedDataSection>
      
      {seedResult && (
        <Card>
          <Subtitle>Seed Result</Subtitle>
          <CodeBlock>{seedResult}</CodeBlock>
        </Card>
      )}
      
      {/* Add a Chat Debug Section */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Chat System Debug</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Test Realtime Connection</h3>
          <button 
            onClick={async () => {
              try {
                console.log("Testing Supabase realtime connection...");
                const channel = supabase.channel('test-channel');
                
                channel
                  .on('broadcast', { event: 'test' }, (payload) => {
                    console.log('Received broadcast message:', payload);
                    alert(`Realtime works! Received: ${JSON.stringify(payload)}`);
                  })
                  .subscribe((status) => {
                    console.log('Subscription status:', status);
                    alert(`Subscription status: ${status}`);
                  });
                  
                // Wait for subscription and then broadcast
                setTimeout(() => {
                  channel.send({
                    type: 'broadcast',
                    event: 'test',
                    payload: { message: 'Hello from broadcast!' }
                  });
                }, 1000);
              } catch (error) {
                console.error("Error testing realtime:", error);
                alert(`Error testing realtime: ${error}`);
              }
            }}
          >
            Test Realtime
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Check Chat Tables</h3>
          <button 
            onClick={async () => {
              try {
                // Check chat_rooms table
                const { data: rooms, error: roomsError } = await supabase
                  .from('chat_rooms')
                  .select('*')
                  .limit(5);
                
                if (roomsError) {
                  console.error("Error fetching chat rooms:", roomsError);
                  alert(`Error fetching chat rooms: ${roomsError.message}`);
                  return;
                }
                
                console.log("Chat rooms:", rooms);
                
                // Check chat_messages table
                const { data: messages, error: messagesError } = await supabase
                  .from('chat_messages')
                  .select('*')
                  .limit(5);
                
                if (messagesError) {
                  console.error("Error fetching chat messages:", messagesError);
                  alert(`Error fetching chat messages: ${messagesError.message}`);
                  return;
                }
                
                console.log("Chat messages:", messages);
                
                alert(`Found ${rooms.length} chat rooms and ${messages.length} messages. Check console for details.`);
              } catch (error) {
                console.error("Error checking chat tables:", error);
                alert(`Error checking chat tables: ${error}`);
              }
            }}
          >
            Check Chat Tables
          </button>
        </div>
        
        <div>
          <h3>Create Test Chat Room & Message</h3>
          <button 
            onClick={async () => {
              if (!user) {
                alert("Please sign in first");
                return;
              }
              
              try {
                // 1. Get user's duos
                const { data: duos, error: duosError } = await supabase
                  .from('duos')
                  .select('id, title')
                  .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                  .limit(1);
                  
                if (duosError || !duos || duos.length === 0) {
                  console.error("Error or no duos found:", duosError);
                  alert("You need at least one duo to create a test chat");
                  return;
                }
                
                console.log("Found duo:", duos[0]);
                
                // 2. Create a test chat room
                const testRoom = {
                  duo1_id: duos[0].id,
                  duo2_id: duos[0].id, // Same duo for testing
                  name: `Test Chat Room ${new Date().toISOString()}`,
                  participants: [{ id: user.id, name: user.email }],
                  created_at: new Date().toISOString(),
                  last_message: "This is a test room",
                  last_message_time: new Date().toISOString()
                };
                
                const { data: room, error: roomError } = await supabase
                  .from('chat_rooms')
                  .insert(testRoom)
                  .select()
                  .single();
                  
                if (roomError) {
                  console.error("Error creating test chat room:", roomError);
                  alert(`Error creating test chat room: ${roomError.message}`);
                  return;
                }
                
                console.log("Created test room:", room);
                
                // 3. Create a test message
                const testMessage = {
                  room_id: room.id,
                  sender_id: user.id,
                  sender_name: user.email,
                  content: "This is a test message sent at " + new Date().toLocaleTimeString(),
                  created_at: new Date().toISOString()
                };
                
                const { data: message, error: messageError } = await supabase
                  .from('chat_messages')
                  .insert(testMessage)
                  .select()
                  .single();
                  
                if (messageError) {
                  console.error("Error creating test message:", messageError);
                  alert(`Error creating test message: ${messageError.message}`);
                  return;
                }
                
                console.log("Created test message:", message);
                alert(`Success! Created test room and message. Go to /chats to see it.`);
                
              } catch (error) {
                console.error("Error creating test chat:", error);
                alert(`Error creating test chat: ${error}`);
              }
            }}
          >
            Create Test Chat
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Debug; 