import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
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

const ProfileCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
`;

// Photo gallery styling
const PhotoGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin: 20px;
`;

const PhotoThumbnail = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 120px;
  border-radius: 4px;
  background-color: #eee;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Add new components for the photo preview modal
const PhotoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PhotoPreview = styled.div<{ imageUrl?: string }>`
  max-width: 90%;
  max-height: 90%;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 80%;
  height: 80%;
  border-radius: 8px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 4px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

// Keep existing styled components
const ProfileAvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 30px auto;
`;

const ProfileAvatar = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${props => props.imageUrl ? 'transparent' : 'var(--primary-color)'};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  overflow: hidden;
  position: relative;
`;

const UploadButton = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #0056b3;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  padding: 20px;
  text-align: center;
`;

const ProfileName = styled.h2`
  margin-bottom: 10px;
`;

const ProfileEmail = styled.p`
  color: var(--light-text);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 30px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark, #0056b3);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background-color: #4caf50;
`;

const LogoutButton = styled(Button)`
  background-color: #f44336;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--light-text)'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
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

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeletePhotoButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${PhotoThumbnail}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: rgba(255, 0, 0, 0.8);
  }
`;

const LocationSection = styled.div`
  margin: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const LocationDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const LocationIcon = styled.span`
  font-size: 24px;
  margin-right: 10px;
`;

const LocationText = styled.span`
  font-size: 16px;
  color: var(--text-color);
`;

type TabType = 'profile' | 'account';

interface ProfileData {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  location?: string;
}

const MAX_PHOTOS = 10;
const BUCKET_NAME = 'profile-images';

const Profile = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.user_metadata?.name || '',
    age: user?.user_metadata?.age || 18,
    bio: '',
    photos: [],
    latitude: user?.user_metadata?.latitude,
    longitude: user?.user_metadata?.longitude,
    location: user?.user_metadata?.location || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bucketReady, setBucketReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Try to create or access the storage bucket
  useEffect(() => {
    const setupStorage = async () => {
      try {
        console.log("Starting storage setup process...");
        
        // First try to get the current session
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(`Auth session error: ${sessionError.message}`);
          setDebugInfo({ type: 'session_error', error: sessionError });
          return;
        }
        
        console.log("Session check complete:", !!session?.session);
        
        // Skip bucket creation and just try to list bucket contents directly
        // This is the same operation as the testBucket function that's working
        console.log(`Attempting to access bucket ${BUCKET_NAME}...`);
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list();
        
        if (error) {
          console.error("Bucket access failed:", error);
          setError(`Storage not ready: ${error.message}`);
          setDebugInfo({ type: 'bucket_access_error', error: error });
          // Don't return here, we'll let the user use the "Test" button
        } else {
          console.log(`Bucket ${BUCKET_NAME} is accessible:`, data);
          setBucketReady(true);
          setMessage(`Storage is ready`);
          setDebugInfo({ type: 'bucket_access_success', files: data });
        }
      } catch (err: any) {
        console.error('Storage setup error:', err);
        setError(`Storage setup failed: ${err.message}`);
        setDebugInfo({ type: 'setup_error', error: err });
      }
    };
    
    if (user) {
      setupStorage();
    }
  }, [user]);
  
  // Manual bucket test function
  const testBucket = async () => {
    try {
      setError('');
      setMessage('Testing bucket connection...');
      
      // Check if we can list the contents of the bucket
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list();
      
      if (error) {
        console.error("Bucket test failed:", error);
        setError(`Bucket test failed: ${error.message}`);
        setDebugInfo({ type: 'bucket_test_error', error: error });
      } else {
        console.log("Bucket test successful:", data);
        setBucketReady(true);
        setMessage('Storage is ready now!');
        setDebugInfo({ type: 'bucket_test_success', files: data });
      }
    } catch (err: any) {
      console.error("Bucket test exception:", err);
      setError(`Bucket test exception: ${err.message}`);
      setDebugInfo({ type: 'bucket_test_exception', error: err });
    }
  };
  
  // Update handling of storage URLs
  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  };
  
  // Fetch profile data from Supabase profiles table
  const fetchProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        console.log('Fetched profile data:', data);
        if (data.photos && data.photos.length > 0) {
          console.log('Photo URLs from database:', data.photos);
        }
        
        setProfileData({
          name: data.name || user?.user_metadata?.name || '',
          age: data.age || user?.user_metadata?.age || 18,
          bio: data.bio || '',
          photos: data.photos || [],
          latitude: data.latitude || user?.user_metadata?.latitude,
          longitude: data.longitude || user?.user_metadata?.longitude,
          location: data.location || user?.user_metadata?.location || ''
        });
        
        // If we have an avatar from metadata, set it
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };
  
  // Use useEffect to fetch profile on component mount or when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);
  
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };
  
  const handleProfileImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAddPhotoClick = () => {
    if (isEditing && galleryFileInputRef.current) {
      galleryFileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      if (!bucketReady) {
        setError('Storage is not ready yet. Please try again.');
        return;
      }
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError(`Error uploading image: ${uploadError.message}`);
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      // Update avatarUrl state instead of profileData
      setAvatarUrl(publicUrl);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Error uploading image: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleGalleryFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    // Check if we've reached the photo limit
    if (profileData.photos.length >= MAX_PHOTOS) {
      setError(`You can only upload up to ${MAX_PHOTOS} photos`);
      return;
    }
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      if (!bucketReady) {
        setError('Storage is not ready yet. Please try again.');
        return;
      }
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `photos/${user.id}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to path:', fileName);
      
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError(`Error uploading image: ${uploadError.message}`);
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      console.log('Photo uploaded successfully, URL:', publicUrl);
      
      // Update profile data with new photo URL
      const updatedPhotos = [...profileData.photos, publicUrl];
      console.log('Updated photos array:', updatedPhotos);
      
      setProfileData({
        ...profileData,
        photos: updatedPhotos
      });
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Error uploading image: ${err.message}`);
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeletePhoto = (index: number) => {
    // Create a copy of the photos array
    const updatedPhotos = [...profileData.photos];
    
    // Remove the photo at the specified index
    updatedPhotos.splice(index, 1);
    
    // Update the state
    setProfileData({
      ...profileData,
      photos: updatedPhotos
    });
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
          
          setProfileData({
            ...profileData,
            latitude,
            longitude,
            location: locationName
          });
          
          setMessage(`Location updated to ${locationName}`);
        } catch (err) {
          console.error('Error getting location name:', err);
          setProfileData({
            ...profileData,
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
  
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      setError('');
      
      if (!user) return;
      
      // Update profile in Supabase profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio,
          photos: profileData.photos,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
          location: profileData.location,
          updated_at: new Date()
        });
      
      if (profileError) {
        setError('Failed to update profile: ' + profileError.message);
        return;
      }
      
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          age: profileData.age,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
          location: profileData.location
        }
      });
      
      if (userError) {
        setError('Failed to update user data: ' + userError.message);
        return;
      }
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError('An error occurred: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Keep avatar URL in a separate state
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Get first letter of name for avatar
  const getInitial = () => {
    return profileData.name.charAt(0).toUpperCase() || '?';
  };
  
  const handlePhotoClick = (photoUrl: string) => {
    if (!isEditing) {
      setSelectedPhoto(photoUrl);
    }
  };
  
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <Container>
      <Header>
        <h1>Profile</h1>
      </Header>
      
      <Tabs>
        <Tab 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </Tab>
        <Tab 
          active={activeTab === 'account'} 
          onClick={() => setActiveTab('account')}
        >
          Account
        </Tab>
      </Tabs>
      
      {!bucketReady && (
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          border: '1px solid #ddd' 
        }}>
          <p>Storage is not ready. This might be due to permissions or configuration issues.</p>
          <button 
            onClick={testBucket} 
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Test Storage Connection
          </button>
          {debugInfo && (
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <p><strong>Debug Info:</strong></p>
              <pre style={{ 
                overflow: 'auto', 
                backgroundColor: '#f1f1f1', 
                padding: '8px', 
                borderRadius: '4px',
                maxHeight: '200px' 
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {/* Photo Modal for previewing */}
      {selectedPhoto && (
        <PhotoModal onClick={closePhotoModal}>
          <PhotoPreview imageUrl={selectedPhoto} onClick={(e) => e.stopPropagation()} />
          <CloseButton onClick={closePhotoModal}>×</CloseButton>
        </PhotoModal>
      )}
      
      {activeTab === 'profile' && (
        <ProfileCard>
          <ProfileAvatarContainer>
            <ProfileAvatar 
              imageUrl={avatarUrl}
              onClick={handleProfileImageClick}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              {!avatarUrl && getInitial()}
            </ProfileAvatar>
            
            {isEditing && (
              <>
                <UploadButton onClick={handleProfileImageClick}>
                  <UploadIcon />
                </UploadButton>
                <FileInput 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </>
            )}
          </ProfileAvatarContainer>
          
          {/* Photos Gallery */}
          <div>
            <h3 style={{ padding: '0 20px' }}>My Photos ({profileData.photos.length}/{MAX_PHOTOS})</h3>
            <PhotoGallery>
              {profileData.photos.map((photo, index) => {
                console.log(`Rendering photo ${index}:`, photo);
                return (
                  <PhotoThumbnail 
                    key={index} 
                    imageUrl={photo}
                    onClick={() => handlePhotoClick(photo)}
                  >
                    {isEditing && (
                      <DeletePhotoButton onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeletePhoto(index);
                      }}>
                        <DeleteIcon />
                      </DeletePhotoButton>
                    )}
                  </PhotoThumbnail>
                );
              })}
              
              {isEditing && profileData.photos.length < MAX_PHOTOS && (
                <PhotoPlaceholder onClick={handleAddPhotoClick}>
                  <PlusIcon />
                </PhotoPlaceholder>
              )}
              
              <FileInput 
                type="file" 
                ref={galleryFileInputRef}
                accept="image/*"
                onChange={handleGalleryFileChange}
                disabled={isUploading || profileData.photos.length >= MAX_PHOTOS}
              />
            </PhotoGallery>
          </div>
          
          {!isEditing ? (
            <ProfileInfo>
              <ProfileName>{profileData.name}</ProfileName>
              <ProfileEmail>{user?.email}</ProfileEmail>
              <p>Age: {profileData.age}</p>
              {profileData.bio && <p style={{ marginTop: '10px' }}>{profileData.bio}</p>}
              
              <ButtonGroup>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </ButtonGroup>
            </ProfileInfo>
          ) : (
            <ProfileInfo>
              <FormGroup>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: Number(e.target.value)})}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="bio">Bio</Label>
                <TextArea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                />
              </FormGroup>
              
              {message && <SuccessMessage>{message}</SuccessMessage>}
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {isUploading && <p>Uploading image...</p>}
              
              <ButtonGroup>
                <SaveButton 
                  onClick={handleSaveProfile} 
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </SaveButton>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </ButtonGroup>
            </ProfileInfo>
          )}
          
          <LocationSection>
            <h3>Location</h3>
            
            {profileData.location ? (
              <LocationDisplay>
                <LocationIcon>📍</LocationIcon>
                <LocationText>{profileData.location}</LocationText>
                {profileData.latitude && profileData.longitude && (
                  <LocationText style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                    ({profileData.latitude.toFixed(6)}, {profileData.longitude.toFixed(6)})
                  </LocationText>
                )}
              </LocationDisplay>
            ) : (
              <LocationDisplay>
                <LocationText>No location set</LocationText>
              </LocationDisplay>
            )}
            
            {isEditing && (
              <Button 
                onClick={handleGetLocation} 
                disabled={isGettingLocation}
              >
                {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
              </Button>
            )}
            
            {isEditing && (
              <FormGroup>
                <Label>Location Name</Label>
                <Input
                  type="text"
                  value={profileData.location || ''}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="e.g. San Francisco, US"
                />
              </FormGroup>
            )}
          </LocationSection>
        </ProfileCard>
      )}
      
      {activeTab === 'account' && (
        <ProfileCard>
          <ProfileInfo>
            <ProfileEmail>{user?.email}</ProfileEmail>
            
            <ButtonGroup>
              <Button>Change Password</Button>
              <LogoutButton onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
              </LogoutButton>
            </ButtonGroup>
          </ProfileInfo>
        </ProfileCard>
      )}
    </Container>
  );
};

export default Profile; 