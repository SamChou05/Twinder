import api from './api';

interface Duo {
  id: string;
  title: string;
  bio?: string;
  photos: string[];
  user1: {
    id: string;
    name: string;
    photos: string[];
  };
  user2: {
    id: string;
    name: string;
    photos: string[];
  };
}

interface Match {
  id: string;
  duoA: Duo;
  duoB: Duo;
  isMatched: boolean;
  createdAt: string;
}

// Get potential matches (swipe deck)
export const getPotentialMatches = async (duoId: string): Promise<Duo[]> => {
  const response = await api.get<Duo[]>(`/match/swipe?duoId=${duoId}`);
  return response.data;
};

// Like a duo
export const likeDuo = async (likerDuoId: string, likedDuoId: string): Promise<{ match?: Match }> => {
  const response = await api.post<{ match?: Match }>('/match/like', {
    likerDuoId,
    likedDuoId
  });
  return response.data;
};

// Dislike a duo
export const dislikeDuo = async (dislikerDuoId: string, dislikedDuoId: string): Promise<void> => {
  await api.post('/match/dislike', {
    dislikerDuoId,
    dislikedDuoId
  });
};

// Get all matches
export const getMatches = async (): Promise<Match[]> => {
  const response = await api.get<Match[]>('/match');
  return response.data;
}; 