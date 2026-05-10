import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {

  getProfile() {
    return { message: "This is your profile information." };
  }
}
