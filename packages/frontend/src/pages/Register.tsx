import { useState, useEffect } from 'react';
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

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LocationSection = styled.div`
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
`;

const LocationStatus = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: ${props => props.isActive ? 'green' : 'inherit'};
`;

const LocationIcon = styled.span`
  font-size: 18px;
  margin-right: 8px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  
  // Location state
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Effect to request location as soon as the component mounts
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got coordinates:', latitude, longitude);
        
        // Try to get address from coordinates using a reverse geocoding service
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          let locationName = 'Your Location';
          if (data && data.display_name) {
            // Extract city and country if available
            const addressParts = data.display_name.split(', ');
            if (addressParts.length >= 2) {
              locationName = `${addressParts[1]}, ${addressParts[addressParts.length - 1]}`;
            } else {
              locationName = data.display_name;
            }
          }
          
          setUserLocation({
            latitude,
            longitude,
            locationName
          });
        } catch (err) {
          console.error('Error getting location name:', err);
          setUserLocation({
            latitude,
            longitude,
            locationName: 'Your Location'
          });
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permission to access location was denied. Location is important for finding matches nearby.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('The request to get location timed out');
            break;
          default:
            setLocationError('An unknown error occurred while getting location');
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

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
    
    // Dispatch register action with location data
    const result = await dispatch(register({ 
      name, 
      email, 
      password,
      age: Number(age),
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      location: userLocation?.locationName
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
        
        <LocationSection>
          <Label>Your Location</Label>
          {isGettingLocation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LoadingSpinner />
              <span>Getting your location...</span>
            </div>
          ) : userLocation ? (
            <>
              <LocationStatus isActive={true}>
                <LocationIcon>✓</LocationIcon>
                <span>Location detected: {userLocation.locationName}</span>
              </LocationStatus>
              <InfoText>Your location helps us find matches nearby</InfoText>
            </>
          ) : (
            <>
              <LocationStatus>
                <LocationIcon>⚠️</LocationIcon>
                <span>{locationError || 'Location not available'}</span>
              </LocationStatus>
              <Button 
                type="button" 
                onClick={handleGetLocation}
                style={{ marginTop: '10px' }}
              >
                Allow Location Access
              </Button>
            </>
          )}
        </LocationSection>
        
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