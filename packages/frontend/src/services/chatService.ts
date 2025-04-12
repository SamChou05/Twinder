import api from './api';

interface User {
  id: string;
  name: string;
  photos: string[];
}

interface Message {
  id: string;
  chatId: string;
  user: User;
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  matchId: string;
  isGroupChat: boolean;
  messages: Message[];
  createdAt: string;
}

// Get all chats for the user
export const getUserChats = async (): Promise<Chat[]> => {
  const response = await api.get<Chat[]>('/chats');
  return response.data;
};

// Get a specific chat with messages
export const getChat = async (chatId: string): Promise<Chat> => {
  const response = await api.get<Chat>(`/chats/${chatId}`);
  return response.data;
};

// Send a message in a chat
export const sendMessage = async (chatId: string, content: string): Promise<Message> => {
  const response = await api.post<Message>(`/chats/${chatId}/message`, { content });
  return response.data;
};

// Create a one-on-one chat from a group chat
export const createPrivateChat = async (matchId: string, otherUserId: string): Promise<Chat> => {
  const response = await api.post<Chat>('/chats/private', { matchId, userId: otherUserId });
  return response.data;
}; 