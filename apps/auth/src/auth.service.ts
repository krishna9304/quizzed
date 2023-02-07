import { APIResponse } from '@app/common/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Teacher } from './users/schemas/teacher.schema';
import { User } from './users/schemas/user.schema';

export interface TokenPayload {
  userId: string;
  regdNo?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User | Teacher, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      regdNo: user.regdNo,
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  getServerStat(): APIResponse {
    return {
      statusCode: 200,
      message: 'Auth Server Running!',
      data: null,
      errors: [],
    };
  }
}
