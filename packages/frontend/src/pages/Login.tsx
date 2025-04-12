import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { login, clearError } from '../store/slices/authSlice';
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

const SuccessMessage = styled.div`
  color: #48c774;
  margin-bottom: 20px;
  text-align: center;
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 20px;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // Get the return URL from location state or default to home
  const from = location.state?.from || '/';
  // Get any success messages passed from other pages (e.g., after registration)
  const message = location.state?.message || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    // Clear any previous errors
    dispatch(clearError());
    
    // Dispatch login action
    const result = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(result)) {
      // If login successful, navigate to the target page
      navigate(from, { replace: true });
    }
  };

  return (
    <Container>
      <Logo>Twinder</Logo>
      <Form onSubmit={handleSubmit}>
        <Title>Sign In</Title>
        
        {message && <SuccessMessage>{message}</SuccessMessage>}
        
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
            placeholder="Enter your password"
            required
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
      
      <RegisterLink>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </RegisterLink>
    </Container>
  );
};

export default Login; 