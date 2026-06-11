import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginateResult } from 'src/common/pagination/paginated-result';


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

   async findAll(dto: PaginationDto) {
    const { page, limit } = dto;
    const [users, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
    });

    return paginateResult(
      [users, total],
      page,
      limit,
    );
  }

   async findOneByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findbyEmailWithPassword(email: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
      }
      

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAndcount(userId:string,page:number=1,limit:number=10){
        const skip = (page - 1) * limit;
        const query = this.userRepo.createQueryBuilder('user')
            .where('user.id = :userId', { userId })
            .skip(skip)
            .take(limit);
        return query.getManyAndCount();
    }

  async updateUser(id: string, data: any) {
    const user = await this.findOne(id);
    if (!user) return null;

    Object.assign(user, data);
    await this.userRepo.save(user);
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.findOne(id);
    if (!user) return null;

    await this.userRepo.delete(id);
    return user;
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findbyEmailWithPassword(email);
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
