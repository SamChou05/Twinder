import { supabase } from '../supabaseClient';

export interface Friend {
  id: string;
  name: string;
  email: string;
  photos?: string[];
  friendshipId?: string;
}

export interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    photos?: string[];
  };
  createdAt: string;
}

// Add UserProfile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photos?: string[];
}

// Get a user's friends
export const getFriends = async (): Promise<Friend[]> => {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        created_at,
        friend:friend_id (
          id, name, email, photos
        )
      `);
    
    if (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
    
    console.log('Friends data from Supabase:', data);
    
    // Map response to match our interface
    const friends: Friend[] = (data || []).map(item => {
      // Handle both array and object formats that might come from Supabase
      const friendData = Array.isArray(item.friend) ? item.friend[0] : item.friend;
      
      return {
        id: friendData.id,
        name: friendData.name,
        email: friendData.email,
        photos: friendData.photos,
        friendshipId: item.id
      };
    });
    
    return friends;
  } catch (error) {
    console.error('Error in getFriends service:', error);
    throw error;
  }
};

// Get pending friend requests for the current user
export const getFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        created_at,
        sender:sender_id (
          id, name, email, photos
        )
      `)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
    
    console.log('Friend requests data from Supabase:', data);
    
    // Map response to match our interface
    const requests: FriendRequest[] = (data || []).map(item => {
      // Handle both array and object formats that might come from Supabase
      const senderData = Array.isArray(item.sender) ? item.sender[0] : item.sender;
      
      return {
        id: item.id,
        sender: {
          id: senderData.id,
          name: senderData.name,
          email: senderData.email,
          photos: senderData.photos
        },
        createdAt: item.created_at
      };
    });
    
    return requests;
  } catch (error) {
    console.error('Error in getFriendRequests service:', error);
    throw error;
  }
};

// Send a friend request to another user
export const sendFriendRequest = async (receiverId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        receiver_id: receiverId,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in sendFriendRequest service:', error);
    throw error;
  }
};

// Respond to a friend request (accept or decline)
export const respondToFriendRequest = async (requestId: string, accept: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ 
        status: accept ? 'accepted' : 'declined' 
      })
      .eq('id', requestId);
    
    if (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in respondToFriendRequest service:', error);
    throw error;
  }
};

// Remove a friend
export const removeFriend = async (friendshipId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    if (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeFriend service:', error);
    throw error;
  }
};

// Search for users by name or email
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, photos')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }
    
    console.log('Search results:', data);
    
    // Map response to match our interface
    const users: UserProfile[] = (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      photos: user.photos
    }));
    
    return users;
  } catch (error) {
    console.error('Error in searchUsers service:', error);
    throw error;
  }
}; 