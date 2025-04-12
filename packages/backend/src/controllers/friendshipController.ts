import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Friendship, FriendshipStatus } from '../models/Friendship';

const userRepository = AppDataSource.getRepository(User);
const friendshipRepository = AppDataSource.getRepository(Friendship);

// Get all friends for the current user
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Get all accepted friendships where the user is either sender or receiver
    const sentFriendships = await friendshipRepository.find({
      where: {
        sender_id: userId,
        status: FriendshipStatus.ACCEPTED
      },
      relations: ['receiver']
    });

    const receivedFriendships = await friendshipRepository.find({
      where: {
        receiver_id: userId,
        status: FriendshipStatus.ACCEPTED
      },
      relations: ['sender']
    });

    // Extract the friend users from friendships
    const friends = [
      ...sentFriendships.map(f => ({
        id: f.receiver.id,
        name: f.receiver.name,
        email: f.receiver.email,
        photos: f.receiver.photos,
        friendshipId: f.id
      })),
      ...receivedFriendships.map(f => ({
        id: f.sender.id,
        name: f.sender.name,
        email: f.sender.email,
        photos: f.sender.photos,
        friendshipId: f.id
      }))
    ];

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error while fetching friends' });
  }
};

// Get friend requests for the current user
export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Get all pending friendships where the user is the receiver
    const pendingRequests = await friendshipRepository.find({
      where: {
        receiver_id: userId,
        status: FriendshipStatus.PENDING
      },
      relations: ['sender']
    });

    // Format the response
    const requests = pendingRequests.map(request => ({
      id: request.id,
      sender: {
        id: request.sender.id,
        name: request.sender.name,
        email: request.sender.email,
        photos: request.sender.photos
      },
      createdAt: request.createdAt
    }));

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Server error while fetching friend requests' });
  }
};

// Send a friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user.id; // From auth middleware
    const { receiverId } = req.body;

    // Validate input
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    // Check if users exist
    const sender = await userRepository.findOne({ where: { id: senderId } });
    const receiver = await userRepository.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Check if sender is trying to add themselves
    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if a friendship already exists
    const existingFriendship = await friendshipRepository.findOne({
      where: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        return res.status(400).json({ error: 'Already friends' });
      } else if (existingFriendship.status === FriendshipStatus.PENDING) {
        return res.status(400).json({ error: 'Friend request already pending' });
      } else if (existingFriendship.status === FriendshipStatus.DECLINED) {
        // If previously declined, update to pending
        existingFriendship.status = FriendshipStatus.PENDING;
        await friendshipRepository.save(existingFriendship);
        return res.status(200).json({ message: 'Friend request sent' });
      }
    }

    // Create new friendship
    const friendship = new Friendship();
    friendship.sender = sender;
    friendship.receiver = receiver;
    friendship.status = FriendshipStatus.PENDING;

    await friendshipRepository.save(friendship);

    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Server error while sending friend request' });
  }
};

// Accept a friend request
export const respondToFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { requestId, accept } = req.body;

    // Validate input
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    // Find the friend request
    const request = await friendshipRepository.findOne({
      where: {
        id: requestId,
        receiver_id: userId, // Ensure the current user is the receiver
        status: FriendshipStatus.PENDING
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Update the request status
    request.status = accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED;
    await friendshipRepository.save(request);

    res.json({ message: accept ? 'Friend request accepted' : 'Friend request declined' });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ error: 'Server error while responding to friend request' });
  }
};

// Remove a friend
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { friendshipId } = req.params;

    // Find the friendship
    const friendship = await friendshipRepository.findOne({
      where: [
        { id: friendshipId, sender_id: userId },
        { id: friendshipId, receiver_id: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    // Delete the friendship
    await friendshipRepository.remove(friendship);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error while removing friend' });
  }
}; 