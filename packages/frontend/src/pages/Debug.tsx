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
    </Container>
  );
};

export default Debug; 