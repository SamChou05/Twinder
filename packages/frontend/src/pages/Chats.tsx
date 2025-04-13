import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../supabaseClient';

const ChatContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 20px;
`;

const ChatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChatItem = styled.div`
  display: flex;
  padding: 15px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ChatAvatar = styled.div<{ imageUrl?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background-color: ${props => props.imageUrl ? 'transparent' : '#ddd'};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #666;
`;

const ChatInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ChatTitle = styled.h3`
  margin: 0 0 5px;
  font-size: 16px;
`;

const LastMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--light-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: var(--light-text);
  margin-left: auto;
  align-self: flex-start;
  padding-left: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  margin-top: 20px;
`;

interface ChatRoom {
  id: string;
  name: string;
  last_message?: string;
  last_message_time?: string;
  photo?: string;
  participants: string[];
  duo1_id: string;
  duo2_id: string;
}

const Chats = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('[DEBUG] Starting fetchChats with user:', user.id);
        
        // First, get the duos the user is part of
        const { data: userDuos, error: duosError } = await supabase
          .from('duos')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (duosError) {
          console.error('[DEBUG] Error fetching user duos:', duosError);
          setLoading(false);
          return;
        }
        
        console.log('[DEBUG] User duos found:', userDuos);
        
        if (!userDuos || userDuos.length === 0) {
          console.log('[DEBUG] User has no duos');
          setLoading(false);
          return;
        }
        
        const duoIds = userDuos.map(duo => duo.id);
        console.log('[DEBUG] User duo IDs:', duoIds);
        
        // Now get all chat rooms where any of these duos are participants
        console.log('[DEBUG] Constructing OR query for chat rooms with duos:', duoIds);
        const orConditions = [
          ...duoIds.map(id => `duo1_id.eq.${id}`),
          ...duoIds.map(id => `duo2_id.eq.${id}`)
        ].join(',');
        console.log('[DEBUG] OR query:', orConditions);
        
        const { data: rooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select(`
            id, 
            name, 
            photo,
            last_message,
            last_message_time,
            duo1_id,
            duo2_id,
            participants
          `)
          .or(orConditions)
          .order('last_message_time', { ascending: false });
        
        if (roomsError) {
          console.error('[DEBUG] Error fetching chat rooms:', roomsError);
          setLoading(false);
          return;
        }
        
        console.log('[DEBUG] Chat rooms found:', rooms);
        setChatRooms(rooms || []);
        setLoading(false);
        
        // Subscribe to changes in the chat_rooms table
        const roomsSubscription = supabase
          .channel('chat_rooms_channel')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'chat_rooms',
              filter: `duo1_id=in.(${duoIds.join(',')})` 
            }, 
            (payload) => {
              console.log('Chat room changed:', payload);
              
              // Refresh the chat rooms
              fetchChats();
            }
          )
          .subscribe();
        
        // Cleanup function to remove the subscription
        return () => {
          roomsSubscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error fetching chats:', err);
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [user]);
  
  const handleChatClick = (chatId: string) => {
    navigate(`/chat-room/${chatId}`);
  };
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <ChatContainer>
      <PageTitle>Chats</PageTitle>
      
      {loading ? (
        <p>Loading your conversations...</p>
      ) : chatRooms.length > 0 ? (
        <ChatList>
          {chatRooms.map(chat => (
            <ChatItem key={chat.id} onClick={() => handleChatClick(chat.id)}>
              <ChatAvatar imageUrl={chat.photo}>
                {!chat.photo && (chat.name.charAt(0) || '?')}
              </ChatAvatar>
              <ChatInfo>
                <ChatTitle>{chat.name || 'Chat'}</ChatTitle>
                <LastMessage>{chat.last_message || 'No messages yet'}</LastMessage>
              </ChatInfo>
              {chat.last_message_time && (
                <MessageTime>{formatTime(chat.last_message_time)}</MessageTime>
              )}
            </ChatItem>
          ))}
        </ChatList>
      ) : (
        <EmptyState>
          <h3>No conversations yet</h3>
          <p>Match with duos to start chatting!</p>
        </EmptyState>
      )}
    </ChatContainer>
  );
};

export default Chats; 