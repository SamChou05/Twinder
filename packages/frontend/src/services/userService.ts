import api from './api';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
}

interface UpdateUserData {
  name?: string;
  bio?: string;
  age?: number;
  photos?: string[];
}

// Get the current user's profile
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/profile');
  return response.data;
};

// Update the current user's profile
export const updateUserProfile = async (data: UpdateUserData): Promise<User> => {
  const response = await api.put<User>('/profile', data);
  return response.data;
};

// Upload a profile photo
export const uploadProfilePhoto = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await api.post<{ url: string }>('/profile/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}; 