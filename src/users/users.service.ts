import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
     private userRepo: Repository<User>
  ){}

   async createUser(name:string, email: string, password: string): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      name,
      email,
      password: hashedPassword,
    };
    return this.userRepo.save(newUser);
    
  }

   async findAll() {
    return this.userRepo.find();
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
  

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    const user = await this.findOne(id);
    if (!user) return null;

    Object.assign(user, data);
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.findOne(id);
    if (!user) return null;

    await this.userRepo.delete(id);
    return user;
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }



  async getProfile(userId: string) {
  const user = await   this.findOne(userId);

  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
}
}
