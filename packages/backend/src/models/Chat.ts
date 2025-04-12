import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Match } from './Match';
import { Message } from './Message';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Match, (match: Match) => match.chat)
  match!: Match;

  @Column({ default: false })
  isGroupChat!: boolean;

  @OneToMany(() => Message, (message: Message) => message.chat)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;
} 