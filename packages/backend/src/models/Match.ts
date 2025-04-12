import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Duo } from './Duo';
import { Chat } from './Chat';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Duo, (duo: Duo) => duo.matchesAsDuoA)
  duoA!: Duo;

  @ManyToOne(() => Duo, (duo: Duo) => duo.matchesAsDuoB)
  duoB!: Duo;

  @Column({ default: false })
  isMatched!: boolean;

  @OneToOne(() => Chat, (chat: Chat) => chat.match)
  chat!: Chat;

  @CreateDateColumn()
  createdAt!: Date;
} 