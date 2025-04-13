import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  &::before {
    content: '←';
    margin-right: 8px;
  }
`;

const ChatTitle = styled.h1`
  margin: 0 0 0 20px;
  font-size: 1.5rem;
`;

const ChatAvatar = styled.div<{ imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.imageUrl ? 'transparent' : '#ddd'};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
`;

const MessageGroup = styled.div`
  margin-bottom: 20px;
`;

const MessageBubble = styled.div<{ isCurrentUser: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 2px;
  align-self: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isCurrentUser ? 'var(--primary-color)' : '#f0f0f0'};
  color: ${props => props.isCurrentUser ? 'white' : 'var(--text-color)'};
  position: relative;
`;

const MessageText = styled.p`
  margin: 0;
  word-wrap: break-word;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: var(--light-text);
  margin-top: 4px;
  display: block;
  text-align: right;
`;

const SenderName = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  color: var(--light-text);
`;

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SendButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark, #0056b3);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  color: var(--light-text);
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  color: #f44336;
`;

const EmptyState = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
  text-align: center;
`;

const ParticipantsList = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ParticipantChip = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 5px 10px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ParticipantAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #666;
`;

const TypingIndicator = styled.div`
  color: var(--light-text);
  font-size: 14px;
  margin-top: 5px;
  font-style: italic;
`;

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface ChatRoomData {
  id: string;
  name: string;
  photo?: string;
  duo1_id: string;
  duo2_id: string;
  participants: {
    id: string;
    name: string;
  }[];
}

const ChatRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [roomData, setRoomData] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userDuos, setUserDuos] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (!id || !user) return;
    
    const fetchChatRoom = async () => {
      try {
        setLoading(true);
        
        // First, get the duos the user is part of
        const { data: duos, error: duosError } = await supabase
          .from('duos')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (duosError) {
          console.error('Error fetching user duos:', duosError);
          setError('Failed to fetch user duos');
          setLoading(false);
          return;
        }
        
        if (!duos || duos.length === 0) {
          setError('You do not have any duos');
          setLoading(false);
          return;
        }
        
        const userDuoIds = duos.map(duo => duo.id);
        setUserDuos(userDuoIds);
        
        // Get the chat room data
        const { data: roomData, error: roomError } = await supabase
          .from('chat_rooms')
          .select('id, name, photo, duo1_id, duo2_id, participants')
          .eq('id', id)
          .single();
        
        if (roomError) {
          console.error('Error fetching chat room:', roomError);
          setError('Failed to fetch chat room');
          setLoading(false);
          return;
        }
        
        // Verify that the user is part of a duo that's in this chat
        const canAccess = 
          userDuoIds.includes(roomData.duo1_id) || 
          userDuoIds.includes(roomData.duo2_id);
        
        if (!canAccess) {
          setError('You do not have access to this chat room');
          setLoading(false);
          return;
        }
        
        setRoomData(roomData);
        
        // Fetch messages
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', id)
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          setError('Failed to fetch messages');
        } else {
          setMessages(messages || []);
        }
        
        setLoading(false);
        
        // Subscribe to new messages
        console.log(`[DEBUG] Setting up subscription for room_${id}`);
        const messagesSubscription = supabase
          .channel(`room_${id}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'chat_messages',
              filter: `room_id=eq.${id}`
            }, 
            (payload) => {
              console.log('[DEBUG] New message received via subscription:', payload);
              setMessages(prev => [...prev, payload.new as Message]);
            }
          )
          .subscribe((status) => {
            console.log(`[DEBUG] Subscription status for room_${id}:`, status);
          });
        
        return () => {
          messagesSubscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Error in fetchChatRoom:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChatRoom();
  }, [id, user]);
  
  const handleBack = () => {
    navigate('/chats');
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !user || !id || !userDuos || userDuos.length === 0) {
      console.log('[DEBUG] Cannot send message. Missing data:', { 
        hasMessageInput: !!messageInput.trim(), 
        hasUser: !!user, 
        hasRoomId: !!id, 
        hasUserDuos: !!userDuos && userDuos.length > 0 
      });
      return;
    }
    
    try {
      setSending(true);
      console.log('[DEBUG] Sending message:', messageInput);
      
      // Get the user's name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('[DEBUG] Error fetching user data:', userError);
        setSending(false);
        return;
      }
      
      console.log('[DEBUG] User data for message:', userData);
      
      // Insert the message
      const newMessage = {
        room_id: id,
        sender_id: user.id,
        sender_name: userData.name,
        content: messageInput.trim()
      };
      console.log('[DEBUG] Inserting message:', newMessage);
      
      const { data: insertedMessage, error: insertError } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single();
      
      if (insertError) {
        console.error('[DEBUG] Error sending message:', insertError);
      } else {
        console.log('[DEBUG] Message inserted successfully:', insertedMessage);
        
        // Update the last message in the chat room
        const updateData = {
          last_message: messageInput.trim(),
          last_message_time: new Date().toISOString()
        };
        console.log('[DEBUG] Updating chat room with:', updateData);
        
        const { data: updatedRoom, error: updateError } = await supabase
          .from('chat_rooms')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (updateError) {
          console.error('[DEBUG] Error updating chat room:', updateError);
        } else {
          console.log('[DEBUG] Chat room updated successfully:', updatedRoom);
        }
        
        setMessageInput('');
      }
    } catch (err) {
      console.error('[DEBUG] Error in handleSendMessage:', err);
    } finally {
      setSending(false);
    }
  };
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today, show only the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show the month, day and time
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show the full date and time
    return `${date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const groupMessagesByTime = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    let lastTime: Date | null = null;
    
    messages.forEach(message => {
      const messageTime = new Date(message.created_at);
      
      // If this is the first message or it's more than 10 minutes after the last one,
      // start a new group
      if (!lastTime || messageTime.getTime() - lastTime.getTime() > 10 * 60 * 1000) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
      
      lastTime = messageTime;
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };
  
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>Back to Chats</BackButton>
        </Header>
        <LoadingState>Loading chat...</LoadingState>
      </Container>
    );
  }
  
  if (error || !roomData) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>Back to Chats</BackButton>
        </Header>
        <ErrorState>
          <h2>Error</h2>
          <p>{error || 'Failed to load chat room'}</p>
        </ErrorState>
      </Container>
    );
  }
  
  const messageGroups = groupMessagesByTime(messages);
  
  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>Back to Chats</BackButton>
        <ChatTitle>{roomData.name}</ChatTitle>
        <ChatAvatar imageUrl={roomData.photo}>
          {!roomData.photo && (roomData.name.charAt(0) || '?')}
        </ChatAvatar>
      </Header>
      
      {roomData.participants && (
        <ParticipantsList>
          {roomData.participants.map((participant, index) => (
            <ParticipantChip key={index}>
              <ParticipantAvatar>
                {participant.name.charAt(0)}
              </ParticipantAvatar>
              {participant.name}
            </ParticipantChip>
          ))}
        </ParticipantsList>
      )}
      
      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <p>No messages yet</p>
            <p>Start the conversation!</p>
          </EmptyState>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <MessageGroup key={groupIndex}>
              {group.map((message, messageIndex) => {
                const isCurrentUser = message.sender_id === user?.id;
                const showSender = !isCurrentUser;
                const isLastInGroup = messageIndex === group.length - 1;
                
                return (
                  <div key={message.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    marginBottom: messageIndex === group.length - 1 ? '10px' : '2px'
                  }}>
                    {showSender && <SenderName>{message.sender_name}</SenderName>}
                    <MessageBubble isCurrentUser={isCurrentUser}>
                      <MessageText>{message.content}</MessageText>
                    </MessageBubble>
                    {isLastInGroup && (
                      <MessageTime>{formatTime(message.created_at)}</MessageTime>
                    )}
                  </div>
                );
              })}
            </MessageGroup>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer onSubmit={handleSendMessage}>
        <MessageInput
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          disabled={sending}
        />
        <SendButton type="submit" disabled={!messageInput.trim() || sending}>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.33 1.67L1.67 8.33l5.83 2.5 2.5 5.84 8.33-15z" stroke="currentColor" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatRoom; 