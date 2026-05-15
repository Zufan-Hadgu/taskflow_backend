import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;


  @ManyToOne(() => User, (user) => user.projects)
  user: User;
  
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @DeleteDateColumn()
   deletedAt: Date;

}