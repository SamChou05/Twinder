import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Duo } from './Duo';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column({ nullable: true })
  bio?: string;

  @Column('text', { array: true, default: [] })
  photos!: string[];

  @OneToMany(() => Duo, (duo: Duo) => duo.user1)
  duosAsUser1!: Duo[];

  @OneToMany(() => Duo, (duo: Duo) => duo.user2)
  duosAsUser2!: Duo[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 