import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
`;

const Select = styled.select`
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
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FriendsButton = styled.a`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  
  &:hover {
    opacity: 0.9;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const LocationSection = styled.div`
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
`;

const LocationStatus = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const LocationIcon = styled.span`
  font-size: 18px;
  margin-right: 8px;
`;

const LocationInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

interface Friend {
  id: string;
  name: string;
  email: string;
  photos?: string[];
  friendshipId?: string;
}

interface DuoFormData {
  bio: string;
  partner: string;
  photos: File[];
}

interface UserLocation {
  latitude?: number;
  longitude?: number;
  location?: string;
}

const DuoCreate = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<DuoFormData>({
    bio: '',
    partner: '',
    photos: []
  });
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  // Fetch user's location from profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('latitude, longitude, location')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          console.log('User location from profile:', data);
          setUserLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            location: data.location
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Fetch friends to select as partners
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user) return;
        
        setIsLoading(true);
        
        // Get current user ID
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;
        
        if (!currentUserId) {
          throw new Error('You must be logged in to view friends');
        }
        
        console.log('Fetching friends for duo creation:', currentUserId);
        
        // Get accepted friendships where user is sender
        const { data: sentFriendships, error: sentError } = await supabase
          .from('friendships')
          .select(`
            id,
            receiver_id,
            users!friendships_receiver_id_fkey (id, name, email, photos)
          `)
          .eq('sender_id', currentUserId)
          .eq('status', 'accepted');
        
        if (sentError) {
          console.error('Error fetching sent friendships:', sentError);
          setError('Failed to load friends list. Please try again later.');
          return;
        }
        
        // Get accepted friendships where user is receiver
        const { data: receivedFriendships, error: receivedError } = await supabase
          .from('friendships')
          .select(`
            id,
            sender_id,
            users!friendships_sender_id_fkey (id, name, email, photos)
          `)
          .eq('receiver_id', currentUserId)
          .eq('status', 'accepted');
        
        if (receivedError) {
          console.error('Error fetching received friendships:', receivedError);
          setError('Failed to load friends list. Please try again later.');
          return;
        }
        
        console.log('Sent friendships:', sentFriendships);
        console.log('Received friendships:', receivedFriendships);
        
        // Format the data
        const sentFriends = (sentFriendships || []).map(friendship => ({
          id: friendship.users?.id,
          name: friendship.users?.name,
          email: friendship.users?.email,
          photos: friendship.users?.photos || [],
          friendshipId: friendship.id
        }));
        
        const receivedFriends = (receivedFriendships || []).map(friendship => ({
          id: friendship.users?.id,
          name: friendship.users?.name,
          email: friendship.users?.email,
          photos: friendship.users?.photos || [],
          friendshipId: friendship.id
        }));
        
        // Combine the results
        const allFriends = [...sentFriends, ...receivedFriends];
        console.log('All friends for duo creation:', allFriends);
        
        setFriends(allFriends);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFriends();
  }, [user]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if adding the new files would exceed the 10 photo limit
    if (formData.photos.length + files.length > 10) {
      setError(`You can only upload up to 10 photos (${formData.photos.length} already selected)`);
      return;
    }
    
    // Add the files to the photos array
    const newPhotos = [...formData.photos];
    for (let i = 0; i < files.length; i++) {
      newPhotos.push(files[i]);
    }
    
    setFormData({...formData, photos: newPhotos});
    
    // Generate temporary preview URLs
    const newPhotoUrls = newPhotos.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs to prevent memory leaks
    photoUrls.forEach(url => URL.revokeObjectURL(url));
    
    setPhotoUrls(newPhotoUrls);
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData({...formData, photos: newPhotos});
    
    // Update preview URLs
    const newPhotoUrls = newPhotos.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs to prevent memory leaks
    photoUrls.forEach(url => URL.revokeObjectURL(url));
    
    setPhotoUrls(newPhotoUrls);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      
      if (!user) {
        setError('You must be logged in to create a duo');
        return;
      }
      
      if (!formData.partner) {
        setError('Please select a partner for your duo');
        return;
      }
      
      // Find the selected friend to get their name
      const selectedFriend = friends.find(friend => friend.id === formData.partner);
      
      if (!selectedFriend) {
        setError('Selected friend not found');
        return;
      }
      
      // Generate duo name from user's name and partner's name
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const partnerName = selectedFriend.name;
      
      // Upload photos if any
      let photoUrls: string[] = [];
      
      if (formData.photos.length > 0) {
        setMessage('Uploading photos...');
        
        // Get the bucket
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        
        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];
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
          
          photoUrls.push(urlData.publicUrl);
        }
      }
      
      // Create the duo in the database including location data
      console.log('Creating duo with:', {
        title: `${userName} & ${partnerName}`,
        bio: formData.bio,
        user1_id: user.id,
        user2_id: formData.partner,
        photos: photoUrls.length,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        location: userLocation?.location
      });
      
      const { data, error: duoError } = await supabase
        .from('duos')
        .insert({
          title: `${userName} & ${partnerName}`,
          bio: formData.bio,
          user1_id: user.id,
          user2_id: formData.partner,
          photos: photoUrls,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          location: userLocation?.location
        })
        .select()
        .single();
      
      if (duoError) {
        console.error('Duo creation error details:', duoError);
        
        if (duoError.code === '42501') {
          setError('Permission denied: You do not have permission to create duos. Please check your database permissions.');
        } else if (duoError.code === '23503') {
          setError('Referenced user does not exist. Please make sure both users exist in the database.');
        } else {
          setError('Failed to create duo: ' + (duoError.message || duoError.details || 'Database error'));
        }
        
        return;
      }
      
      console.log('Duo created successfully:', data);
      
      setMessage('Duo created successfully!');
      
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
  
  // If there are no friends, show a message to add friends first
  if (friends.length === 0 && !isLoading) {
    return (
      <Container>
        <Header>
          <h1>Create a Duo</h1>
        </Header>
        
        <EmptyState>
          <h2>You need friends to create a duo!</h2>
          <p>Before creating a duo, you need to add friends to your profile.</p>
          <p>Go to the Friends page to find and add people you know.</p>
          <FriendsButton href="/friends">Find Friends</FriendsButton>
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <h1>Create a Duo</h1>
        <p>Partner up with a friend for duo matching</p>
      </Header>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="partner">Select Friend as Partner</Label>
            <Select
              id="partner"
              value={formData.partner}
              onChange={(e) => setFormData({...formData, partner: e.target.value})}
              required
            >
              <option value="">-- Select a Friend --</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.id}>
                  {friend.name} ({friend.email})
                </option>
              ))}
            </Select>
          </FormGroup>
          
          {/* Location section */}
          <LocationSection>
            <Label>Location</Label>
            {userLocation && userLocation.location ? (
              <>
                <LocationStatus>
                  <LocationIcon>📍</LocationIcon>
                  <span>Your duo will use your current location: <strong>{userLocation.location}</strong></span>
                </LocationStatus>
                <LocationInfo>
                  Your location helps find nearby duo matches. This is inherited from your profile.
                </LocationInfo>
              </>
            ) : (
              <>
                <LocationStatus>
                  <LocationIcon>⚠️</LocationIcon>
                  <span>No location found in your profile</span>
                </LocationStatus>
                <LocationInfo>
                  Update your location in your profile settings to improve matching.
                </LocationInfo>
              </>
            )}
          </LocationSection>
          
          <FormGroup>
            <Label>Duo Photos (up to 10)</Label>
            <PhotosContainer>
              {photoUrls.map((url, index) => (
                <PhotoPreview key={index}>
                  <img src={url} alt={`Duo photo ${index + 1}`} />
                  <RemovePhotoButton type="button" onClick={() => removePhoto(index)}>
                    ✕
                  </RemovePhotoButton>
                </PhotoPreview>
              ))}
              
              {formData.photos.length < 10 && (
                <PhotoUploadButton>
                  <span>+</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    multiple={formData.photos.length < 9}
                  />
                </PhotoUploadButton>
              )}
            </PhotosContainer>
            <PhotosHelp>
              {formData.photos.length}/10 photos selected
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
          
          {message && <SuccessMessage>{message}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Duo'}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

// New styled components for photo upload
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

export default DuoCreate; 