import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, DeleteDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
@Index(["userId","name"])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column()
  userId: string;


  @ManyToOne(() => User, (user) => user.projects,{
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @DeleteDateColumn()
   deletedAt: Date;

}