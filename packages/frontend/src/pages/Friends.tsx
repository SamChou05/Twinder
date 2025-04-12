import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'inherit'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const Card = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 20px;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: white;
`;

const UserAvatar = styled.div<{ imageUrl?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #eee;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: bold;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 5px;
  font-size: 16px;
`;

const UserEmail = styled.p`
  margin: 0;
  color: #777;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled(Button)`
  background-color: #f44336;
`;

const AcceptButton = styled(Button)`
  background-color: #4caf50;
  margin-right: 10px;
`;

const DeclineButton = styled(Button)`
  background-color: #f44336;
`;

const Message = styled.div<{ isError?: boolean }>`
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.isError ? '#c62828' : '#2e7d32'};
  margin-bottom: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: #777;
`;

interface User {
  id: string;
  name: string;
  email: string;
  photos: string[];
  friendshipId?: string;
}

interface FriendRequest {
  id: string;
  sender: User;
  createdAt: string;
}

type TabType = 'friends' | 'requests' | 'find';

const Friends = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Fetch friends
  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('You must be logged in to view friends');
      }
      
      console.log('Fetching friends for user:', currentUserId);
      
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
        throw new Error(sentError.message);
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
        throw new Error(receivedError.message);
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
      console.log('All friends:', allFriends);
      
      setFriends(allFriends);
    } catch (err: any) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('You must be logged in to view friend requests');
      }
      
      console.log('Fetching friend requests for user:', currentUserId);
      
      // Get pending friendships where user is receiver
      const { data: pendingRequests, error } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          users!friendships_sender_id_fkey (id, name, email, photos)
        `)
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching friend requests:', error);
        throw new Error(error.message);
      }
      
      console.log('Pending requests:', pendingRequests);
      
      // Format the data
      const formattedRequests = (pendingRequests || []).map(request => ({
        id: request.id,
        sender: {
          id: request.users?.id,
          name: request.users?.name,
          email: request.users?.email,
          photos: request.users?.photos || []
        },
        createdAt: request.created_at
      }));
      
      console.log('Formatted requests:', formattedRequests);
      setRequests(formattedRequests);
    } catch (err: any) {
      console.error('Error fetching friend requests:', err);
      setError('Failed to load friend requests: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for users
  const searchUsers = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Searching for users with term:', searchTerm);
      
      // Use the auth API directly
      const { data: sessionData } = await supabase.auth.getSession();
      
      // For demo purposes, get all users and filter client-side
      // In production, you would implement a proper server-side search endpoint
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email, raw_user_meta_data')
        .or(`raw_user_meta_data->name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      
      if (authError) {
        console.error('Error searching users:', authError);
        
        // Try a simpler approach if the above fails
        const { data: simpleUsers, error: simpleError } = await supabase
          .from('users')
          .select('*');
        
        if (simpleError) {
          console.error('Error with simple user query:', simpleError);
          setError(`Search error: ${authError.message}`);
          setSearchResults([]);
          return;
        }
        
        console.log('All users from simple query:', simpleUsers);
        
        // Manual filtering
        const filteredUsers = (simpleUsers || [])
          .filter(u => 
            u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            u.id !== user?.id
          )
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
            photos: u.photos || []
          }));
        
        // Filter out existing friends
        const friendIds = friends.map(friend => friend.id);
        const finalResults = filteredUsers.filter(u => !friendIds.includes(u.id));
        
        setSearchResults(finalResults);
        return;
      }
      
      console.log('Raw user results:', authUsers);
      
      // Map the users from auth.users to our format
      const mappedUsers = (authUsers || [])
        .filter(authUser => 
          authUser.id !== user?.id && (
            (authUser.raw_user_meta_data && 
             authUser.raw_user_meta_data.name && 
             authUser.raw_user_meta_data.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (authUser.email && 
             authUser.email.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        )
        .map(authUser => ({
          id: authUser.id,
          name: authUser.raw_user_meta_data?.name || 'Unknown',
          email: authUser.email || '',
          photos: authUser.raw_user_meta_data?.photos || []
        }));
      
      console.log('Mapped user results:', mappedUsers);
      
      // Filter out users who are already friends
      const friendIds = friends.map(friend => friend.id);
      const filteredResults = mappedUsers.filter(u => !friendIds.includes(u.id));
      
      setSearchResults(filteredResults);
    } catch (err: any) {
      console.error('Error in searchUsers:', err);
      setError(`Failed to search users: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send friend request
  const sendFriendRequest = async (receiverId: string) => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      
      console.log('Sending friend request to:', receiverId);
      
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('You must be logged in to send friend requests');
      }
      
      // Insert directly into the friendships table
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error inserting friend request:', error);
        
        // Check for specific error cases
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You have already sent a friend request to this user');
        }
        
        throw new Error(error.message || 'Failed to send friend request');
      }
      
      console.log('Friend request sent successfully:', data);
      setMessage('Friend request sent!');
      
      // Remove the user from search results
      setSearchResults(searchResults.filter(user => user.id !== receiverId));
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      setError(`Failed to send friend request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Respond to friend request
  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      setIsLoading(true);
      
      console.log('Responding to friend request:', requestId, 'Accept:', accept);
      
      // Update friendship status directly in Supabase
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error responding to friend request:', error);
        throw new Error(error.message);
      }
      
      console.log('Response successful:', data);
      
      // Update UI
      setRequests(requests.filter(req => req.id !== requestId));
      
      if (accept) {
        setMessage('Friend request accepted!');
        fetchFriends(); // Refresh friends list
      } else {
        setMessage('Friend request declined');
      }
    } catch (err: any) {
      console.error('Error responding to friend request:', err);
      setError(`Failed to process friend request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove friend
  const removeFriend = async (friendshipId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('Removing friendship:', friendshipId);
      
      // Delete friendship directly from Supabase
      const { data, error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      
      if (error) {
        console.error('Error removing friend:', error);
        throw new Error(error.message);
      }
      
      console.log('Friend removed successfully:', data);
      
      // Update UI
      setFriends(friends.filter(friend => friend.friendshipId !== friendshipId));
      setMessage('Friend removed successfully');
    } catch (err: any) {
      console.error('Error removing friend:', err);
      setError(`Failed to remove friend: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Load data based on active tab
  useEffect(() => {
    setMessage('');
    setError('');
    
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchFriendRequests();
    }
  }, [activeTab]);
  
  // Search for users when search term changes
  useEffect(() => {
    if (activeTab === 'find') {
      const debounce = setTimeout(() => {
        searchUsers();
      }, 300);
      
      return () => clearTimeout(debounce);
    }
  }, [searchTerm, activeTab]);
  
  return (
    <Container>
      <Header>
        <h1>Friends</h1>
      </Header>
      
      <Tabs>
        <Tab 
          active={activeTab === 'friends'} 
          onClick={() => setActiveTab('friends')}
        >
          My Friends
        </Tab>
        <Tab 
          active={activeTab === 'requests'} 
          onClick={() => setActiveTab('requests')}
        >
          Friend Requests
        </Tab>
        <Tab 
          active={activeTab === 'find'} 
          onClick={() => setActiveTab('find')}
        >
          Find Friends
        </Tab>
      </Tabs>
      
      <Card>
        {message && <Message>{message}</Message>}
        {error && <Message isError>{error}</Message>}
        
        {activeTab === 'find' && (
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search for users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        )}
        
        {activeTab === 'friends' && (
          <UserList>
            {isLoading ? (
              <p>Loading your friends...</p>
            ) : friends.length === 0 ? (
              <EmptyState>
                <p>You don't have any friends yet.</p>
                <Button onClick={() => setActiveTab('find')}>Find Friends</Button>
              </EmptyState>
            ) : (
              friends.map(friend => (
                <UserCard key={friend.id}>
                  <UserAvatar imageUrl={friend.photos?.[0]}>
                    {!friend.photos?.[0] && getUserInitials(friend.name)}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>{friend.name}</UserName>
                    <UserEmail>{friend.email}</UserEmail>
                  </UserInfo>
                  <RemoveButton onClick={() => friend.friendshipId && removeFriend(friend.friendshipId)}>
                    Remove
                  </RemoveButton>
                </UserCard>
              ))
            )}
          </UserList>
        )}
        
        {activeTab === 'requests' && (
          <UserList>
            {isLoading ? (
              <p>Loading friend requests...</p>
            ) : requests.length === 0 ? (
              <EmptyState>
                <p>You don't have any pending friend requests.</p>
              </EmptyState>
            ) : (
              requests.map(request => (
                <UserCard key={request.id}>
                  <UserAvatar imageUrl={request.sender.photos?.[0]}>
                    {!request.sender.photos?.[0] && getUserInitials(request.sender.name)}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>{request.sender.name}</UserName>
                    <UserEmail>{request.sender.email}</UserEmail>
                  </UserInfo>
                  <div>
                    <AcceptButton 
                      onClick={() => respondToFriendRequest(request.id, true)}
                      disabled={isLoading}
                    >
                      Accept
                    </AcceptButton>
                    <DeclineButton 
                      onClick={() => respondToFriendRequest(request.id, false)}
                      disabled={isLoading}
                    >
                      Decline
                    </DeclineButton>
                  </div>
                </UserCard>
              ))
            )}
          </UserList>
        )}
        
        {activeTab === 'find' && (
          <UserList>
            {isLoading ? (
              <p>Searching...</p>
            ) : searchTerm && searchResults.length === 0 ? (
              <EmptyState>
                <p>No users found matching "{searchTerm}"</p>
              </EmptyState>
            ) : !searchTerm ? (
              <EmptyState>
                <p>Start typing to search for users</p>
              </EmptyState>
            ) : (
              searchResults.map(user => (
                <UserCard key={user.id}>
                  <UserAvatar imageUrl={user.photos?.[0]}>
                    {!user.photos?.[0] && getUserInitials(user.name)}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserInfo>
                  <Button 
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={isLoading}
                  >
                    Add Friend
                  </Button>
                </UserCard>
              ))
            )}
          </UserList>
        )}
      </Card>
    </Container>
  );
};

export default Friends; 