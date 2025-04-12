import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Match } from './Match';

@Entity()
export class Duo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  bio?: string;

  @Column('text', { array: true, default: [] })
  photos!: string[];

  @ManyToOne(() => User, (user: User) => user.duosAsUser1)
  user1!: User;

  @ManyToOne(() => User, (user: User) => user.duosAsUser2)
  user2!: User;

  @OneToMany(() => Match, (match: Match) => match.duoA)
  matchesAsDuoA!: Match[];

  @OneToMany(() => Match, (match: Match) => match.duoB)
  matchesAsDuoB!: Match[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 