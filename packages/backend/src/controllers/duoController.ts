import { Request, Response } from 'express';
import { Duo } from '../models/Duo';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

const duoRepository = AppDataSource.getRepository(Duo);
const userRepository = AppDataSource.getRepository(User);

// Create a new duo profile
export const createDuo = async (req: Request, res: Response) => {
  try {
    const { title, bio, photos, userId2 } = req.body;
    const userId1 = req.user.id; // From auth middleware

    // Get both users
    const user1 = await userRepository.findOne({ where: { id: userId1 } });
    const user2 = await userRepository.findOne({ where: { id: userId2 } });

    if (!user1 || !user2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Create new duo
    const duo = new Duo();
    duo.title = title;
    duo.bio = bio;
    duo.photos = photos || [];
    duo.user1 = user1;
    duo.user2 = user2;

    // Save duo to database
    await duoRepository.save(duo);

    res.status(201).json(duo);
  } catch (error) {
    console.error('Duo creation error:', error);
    res.status(500).json({ error: 'Server error during duo creation' });
  }
};

// Get all duo profiles for a user
export const getUserDuos = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Find duos where user is either user1 or user2
    const duos = await duoRepository.find({
      where: [
        { user1: { id: userId } },
        { user2: { id: userId } }
      ],
      relations: ['user1', 'user2']
    });

    res.json(duos);
  } catch (error) {
    console.error('Get duos error:', error);
    res.status(500).json({ error: 'Server error while fetching duos' });
  }
};

// Get a specific duo profile
export const getDuo = async (req: Request, res: Response) => {
  try {
    const duoId = req.params.id;
    const userId = req.user.id; // From auth middleware

    // Find duo
    const duo = await duoRepository.findOne({
      where: { id: duoId },
      relations: ['user1', 'user2']
    });

    if (!duo) {
      return res.status(404).json({ error: 'Duo not found' });
    }

    // Check if the requesting user is part of the duo
    if (duo.user1.id !== userId && duo.user2.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this duo' });
    }

    res.json(duo);
  } catch (error) {
    console.error('Get duo error:', error);
    res.status(500).json({ error: 'Server error while fetching duo' });
  }
};

// Update a duo profile
export const updateDuo = async (req: Request, res: Response) => {
  try {
    const duoId = req.params.id;
    const userId = req.user.id; // From auth middleware
    const { title, bio, photos } = req.body;

    // Find duo
    const duo = await duoRepository.findOne({
      where: { id: duoId },
      relations: ['user1', 'user2']
    });

    if (!duo) {
      return res.status(404).json({ error: 'Duo not found' });
    }

    // Check if the requesting user is part of the duo
    if (duo.user1.id !== userId && duo.user2.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this duo' });
    }

    // Update duo fields
    duo.title = title ?? duo.title;
    duo.bio = bio ?? duo.bio;
    duo.photos = photos ?? duo.photos;

    // Save updated duo
    await duoRepository.save(duo);

    res.json(duo);
  } catch (error) {
    console.error('Update duo error:', error);
    res.status(500).json({ error: 'Server error during duo update' });
  }
}; 