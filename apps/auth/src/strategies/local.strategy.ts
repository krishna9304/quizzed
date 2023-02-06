import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'regdNo' });
  }

  async validate(regdNo: string, password: string) {
    let type = 'student';
    if (regdNo.slice(0, 3) === 'TCH') type = 'teacher';
    return this.usersService.validateUser(regdNo, password, type);
  }
}
