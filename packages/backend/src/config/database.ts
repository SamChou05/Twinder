import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Duo } from '../models/Duo';
import { Match } from '../models/Match';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'twinder',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Duo, Match, Chat, Message],
  migrations: [],
  subscribers: [],
}); 