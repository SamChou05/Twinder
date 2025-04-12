import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { RootState } from '../store';
import { supabase } from '../supabaseClient';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  padding: 10px;
  text-align: center;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  padding: 10px;
  text-align: center;
  margin-top: 10px;
`;

const PhotosContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const PhotoUploadButton = styled.label`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  
  span {
    font-size: 24px;
    color: #999;
  }
  
  input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  
  &:hover {
    border-color: var(--primary-color);
    
    span {
      color: var(--primary-color);
    }
  }
`;

const PhotosHelp = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #777;
`;

const LocationContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const LocationButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const LocationInfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const LocationDetails = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const DuoTitle = styled.h2`
  margin-bottom: 20px;
`;

interface DuoFormData {
  bio: string;
  newPhotos: File[];
  existingPhotos: string[];
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface Duo {
  id: string;
  bio: string;
  title?: string;
  user1_id: string;
  user2_id: string;
  user1: {
    id: string;
    name: string;
    email: string;
  };
  user2: {
    id: string;
    name: string;
    email: string;
  };
  photos?: string[];
  latitude?: number;
  longitude?: number;
  location?: string;
}

const DuoEdit = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  console.log('DuoEdit component mounted with ID param:', id);
  console.log('Current authenticated user:', user?.id);
  console.log('Route params:', useParams());
  
  const [duo, setDuo] = useState<Duo | null>(null);
  const [formData, setFormData] = useState<DuoFormData>({
    bio: '',
    newPhotos: [],
    existingPhotos: [],
    latitude: undefined,
    longitude: undefined,
    location: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Fetch duo details
  useEffect(() => {
    const fetchDuo = async () => {
      try {
        if (!user || !id) {
          console.error('Missing user or duo ID', { userId: user?.id, duoId: id });
          return;
        }
        
        console.log('Fetching duo data for ID:', id);
        
        setIsLoading(true);
        
        console.log('Fetching duo with ID:', id);
        
        // Fetch the duo
        const { data, error: duoError } = await supabase
          .from('duos')
          .select(`
            id,
            bio,
            title,
            user1_id,
            user2_id,
            user1:user1_id(id, name, email),
            user2:user2_id(id, name, email),
            photos,
            latitude,
            longitude,
            location
          `)
          .eq('id', id)
          .single();
        
        if (duoError) {
          console.error('Error fetching duo:', duoError);
          setError('Failed to load duo details: ' + duoError.message);
          setIsLoading(false);
          return;
        }
        
        console.log('Duo data retrieved:', data);
        
        // Check if the user is part of this duo
        if (data.user1_id !== user.id && data.user2_id !== user.id) {
          console.error('Permission denied: User is not part of this duo');
          setError('You do not have permission to edit this duo. Only members of the duo can edit it.');
          setIsLoading(false);
          return;
        }
        
        // Cast the response data
        const typedDuo = {
          id: data.id,
          bio: data.bio,
          title: data.title,
          user1_id: data.user1_id,
          user2_id: data.user2_id,
          user1: (Array.isArray(data.user1) ? data.user1[0] : data.user1) as {
            id: string;
            name: string;
            email: string;
          },
          user2: (Array.isArray(data.user2) ? data.user2[0] : data.user2) as {
            id: string;
            name: string;
            email: string;
          },
          photos: data.photos || [],
          latitude: data.latitude,
          longitude: data.longitude,
          location: data.location || ''
        };
        
        setDuo(typedDuo);
        
        // Initialize form data
        setFormData({
          bio: typedDuo.bio || '',
          newPhotos: [],
          existingPhotos: typedDuo.photos || [],
          latitude: typedDuo.latitude,
          longitude: typedDuo.longitude,
          location: typedDuo.location
        });
        
        console.log('Duo successfully loaded for editing:', typedDuo.id);
        
      } catch (err) {
        console.error('Error fetching duo:', err);
        setError('An unexpected error occurred while loading the duo');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDuo();
  }, [user, id]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if adding the new files would exceed the 10 photo limit
    const totalPhotoCount = formData.existingPhotos.length + formData.newPhotos.length;
    if (totalPhotoCount + files.length > 10) {
      setError(`You can only have up to 10 photos (${totalPhotoCount} already selected)`);
      return;
    }
    
    // Add the files to the newPhotos array
    const newPhotos = [...formData.newPhotos];
    for (let i = 0; i < files.length; i++) {
      newPhotos.push(files[i]);
    }
    
    setFormData({...formData, newPhotos});
    
    // Generate temporary preview URLs
    const newPhotoUrls = newPhotos.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs to prevent memory leaks
    photoUrls.forEach(url => URL.revokeObjectURL(url));
    
    setPhotoUrls(newPhotoUrls);
  };
  
  const removeExistingPhoto = (index: number) => {
    const existingPhotos = [...formData.existingPhotos];
    existingPhotos.splice(index, 1);
    setFormData({...formData, existingPhotos});
  };
  
  const removeNewPhoto = (index: number) => {
    const newPhotos = [...formData.newPhotos];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(photoUrls[index]);
    
    newPhotos.splice(index, 1);
    
    // Update the photoUrls array
    const updatedPhotoUrls = photoUrls.filter((_, i) => i !== index);
    
    setFormData({...formData, newPhotos});
    setPhotoUrls(updatedPhotoUrls);
  };
  
  // Get the duo display name from the two users
  const getDuoName = (duo: Duo) => {
    const user1Name = duo.user1?.name?.split(' ')[0] || 'User 1';
    const user2Name = duo.user2?.name?.split(' ')[0] || 'User 2';
    return `${user1Name} & ${user2Name}`;
  };
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingLocation(true);
    setError('');
    
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
          
          let locationName = 'Unknown location';
          if (data && data.display_name) {
            // Extract city and country if available
            const addressParts = data.display_name.split(', ');
            if (addressParts.length >= 2) {
              locationName = `${addressParts[1]}, ${addressParts[addressParts.length - 1]}`;
            } else {
              locationName = data.display_name;
            }
          }
          
          setFormData({
            ...formData,
            latitude,
            longitude,
            location: locationName
          });
          
          setMessage('Location updated successfully!');
        } catch (err) {
          console.error('Error getting location name:', err);
          setFormData({
            ...formData,
            latitude,
            longitude,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          setMessage('Location coordinates updated');
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permission to access location was denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('The request to get location timed out');
            break;
          default:
            setError('An unknown error occurred while getting location');
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  const handleClearLocation = () => {
    setFormData({
      ...formData,
      latitude: undefined,
      longitude: undefined,
      location: ''
    });
    setMessage('Location cleared');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      
      if (!user || !duo) {
        setError('You must be logged in and have a valid duo to update');
        return;
      }
      
      // Upload new photos if any
      let allPhotoUrls = [...formData.existingPhotos];
      
      if (formData.newPhotos.length > 0) {
        setMessage('Uploading new photos...');
        
        // Get the bucket
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        
        for (let i = 0; i < formData.newPhotos.length; i++) {
          const file = formData.newPhotos[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}_${Date.now()}_${i}.${fileExt}`;
          const filePath = `duo-photos/${fileName}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('profile-images')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error('Error uploading photo:', uploadError);
            setError(`Error uploading photo ${i+1}: ${uploadError.message}`);
            setIsLoading(false);
            return;
          }
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);
          
          allPhotoUrls.push(urlData.publicUrl);
        }
      }
      
      // Update the duo in the database
      const { data, error: duoError } = await supabase
        .from('duos')
        .update({
          bio: formData.bio,
          // Generate the title from user names
          title: getDuoName(duo),
          photos: allPhotoUrls,
          latitude: formData.latitude,
          longitude: formData.longitude,
          location: formData.location
        })
        .eq('id', duo.id)
        .select()
        .single();
      
      if (duoError) {
        setError('Failed to update duo: ' + duoError.message);
        return;
      }
      
      setMessage('Duo updated successfully!');
      
      // Redirect to the duos page after a short delay
      setTimeout(() => {
        navigate('/duos');
      }, 2000);
    } catch (err: any) {
      setError('An error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Container>
        <Header>
          <h1>Edit Duo</h1>
        </Header>
        <Card>
          <p>Loading duo details...</p>
        </Card>
      </Container>
    );
  }
  
  if (error && !duo) {
    return (
      <Container>
        <Header>
          <h1>Edit Duo</h1>
        </Header>
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => navigate('/duos')}>Back to Duos</Button>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <h1>Edit Duo</h1>
        {duo && <DuoTitle>{getDuoName(duo)}</DuoTitle>}
      </Header>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Duo Photos (up to 10)</Label>
            <PhotosContainer>
              {/* Existing photos */}
              {formData.existingPhotos.map((url, index) => (
                <PhotoPreview key={`existing-${index}`}>
                  <img src={url} alt={`Duo photo ${index + 1}`} />
                  <RemovePhotoButton type="button" onClick={() => removeExistingPhoto(index)}>
                    ✕
                  </RemovePhotoButton>
                </PhotoPreview>
              ))}
              
              {/* New photos being uploaded */}
              {formData.newPhotos.map((_, index) => (
                <PhotoPreview key={`new-${index}`}>
                  <img src={photoUrls[index]} alt={`New duo photo ${index + 1}`} />
                  <RemovePhotoButton type="button" onClick={() => removeNewPhoto(index)}>
                    ✕
                  </RemovePhotoButton>
                </PhotoPreview>
              ))}
              
              {/* Upload button */}
              {formData.existingPhotos.length + formData.newPhotos.length < 10 && (
                <PhotoUploadButton>
                  <span>+</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    multiple={formData.existingPhotos.length + formData.newPhotos.length < 9}
                  />
                </PhotoUploadButton>
              )}
            </PhotosContainer>
            <PhotosHelp>
              {formData.existingPhotos.length + formData.newPhotos.length}/10 photos selected
            </PhotosHelp>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="bio">Duo Bio</Label>
            <TextArea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell other duos about yourselves..."
            />
          </FormGroup>
          
          {/* Location section */}
          <LocationContainer>
            <Label>Location</Label>
            <LocationInfoText>
              Adding your location helps find activities and other duos nearby.
            </LocationInfoText>
            
            {(formData.latitude && formData.longitude) ? (
              <LocationDetails>
                <strong>{formData.location || 'Location set'}</strong>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
              </LocationDetails>
            ) : (
              <LocationInfoText>No location set</LocationInfoText>
            )}
            
            <LocationButtons>
              <Button 
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                style={{ width: 'auto' }}
              >
                {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
              </Button>
              
              {(formData.latitude && formData.longitude) && (
                <Button 
                  type="button"
                  onClick={handleClearLocation}
                  style={{ 
                    width: 'auto', 
                    backgroundColor: '#f44336' 
                  }}
                >
                  Clear Location
                </Button>
              )}
            </LocationButtons>
            
            <FormGroup>
              <Label>Location Name</Label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. San Francisco, CA"
                className="form-control"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </FormGroup>
          </LocationContainer>
          
          {message && <SuccessMessage>{message}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Duo'}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default DuoEdit; 