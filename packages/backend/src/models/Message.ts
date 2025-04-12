import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Chat } from './Chat';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  chat!: Chat;

  @ManyToOne(() => User)
  user!: User;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  timestamp!: Date;
} 