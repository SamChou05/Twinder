import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { register, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Logo = styled.h1`
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 40px;
`;

const Form = styled.form`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3860;
  margin-top: 20px;
  text-align: center;
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 20px;
`;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !age) {
      return;
    }
    
    if (isNaN(Number(age)) || Number(age) < 18) {
      return;
    }
    
    // Clear any previous errors
    dispatch(clearError());
    
    // Dispatch register action
    const result = await dispatch(register({ 
      name, 
      email, 
      password,
      age: Number(age)
    }));
    
    if (register.fulfilled.match(result)) {
      // If registration is successful, navigate to login
      // Note: Supabase might require email verification depending on your settings
      navigate('/login', { 
        state: { message: 'Registration successful! Please check your email for verification.' } 
      });
    }
  };

  return (
    <Container>
      <Logo>Twinder</Logo>
      <Form onSubmit={handleSubmit}>
        <Title>Create Account</Title>
        
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            minLength={6}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            min={18}
            required
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
      
      <LoginLink>
        Already have an account? <Link to="/login">Sign In</Link>
      </LoginLink>
    </Container>
  );
};

export default Register; 