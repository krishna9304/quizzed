import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from './schemas/user.schema';
import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { CreateTeacherRequest } from './dto/create-teacher.request';
import { TeachersRepository } from './teachers.repository';
import { Teacher } from './schemas/teacher.schema';
import { MAIL_SERVICE } from '@app/common/auth/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly teachersRepository: TeachersRepository,
    @Inject(MAIL_SERVICE) private mailClient: ClientProxy,
  ) {}

  async createUser(request: CreateUserRequest) {
    try {
      await this.validateCreateUserRequest(request);
      return await this.usersRepository.create(request);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createTeacher(request: CreateTeacherRequest, type: string = 'teacher') {
    try {
      await this.validateCreateUserRequest(request, type);
      const otp: number = Math.floor(100000 + Math.random() * 900000);
      const teacher = await this.teachersRepository.create({
        ...request,
        regdNo:
          'TCH' +
          request.primaryPhone.slice(-4) +
          request.name.slice(0, 3).toUpperCase() +
          request.name.slice(-2).toUpperCase(),
        password: await bcrypt.hash(request.password, 10),
        metadata: { otp },
      });
      await lastValueFrom(
        this.mailClient.emit('teacher_registered', {
          name: request.name,
          email: request.email,
          otp,
        }),
      );
      return teacher.regdNo;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private async validateCreateUserRequest(
    request: Partial<CreateUserRequest | CreateTeacherRequest>,
    type: string = 'student',
  ) {
    let user: User | Teacher;
    try {
      user = await this[
        type === 'teacher' ? 'teachersRepository' : 'usersRepository'
      ].findOne({
        $or: [
          { email: request.email },
          { regdNo: request.regdNo },
          { primaryPhone: request.primaryPhone },
        ],
      });
    } catch (err) {}

    if (user) {
      throw new UnprocessableEntityException(
        'User with similar details already exists.',
      );
    }
  }

  async validateUser(
    regdNo: string,
    password: string,
    type: string = 'student',
  ) {
    const user = await this[
      type === 'teacher' ? 'teachersRepository' : 'usersRepository'
    ].findOne({ regdNo });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    if (user.status !== 'active') {
      const otp: number = Math.floor(100000 + Math.random() * 900000);
      await lastValueFrom(
        this.mailClient.emit('teacher_registered', {
          name: user.name,
          email: user.email,
          otp,
        }),
      );
      await this.teachersRepository.findOneAndUpdate(
        { regdNo: user.regdNo },
        { metadata: { otp } },
      );
      throw new UnauthorizedException(
        'Your account is not verified yet. Kindly verify it by entering the OTP received in your registered email address.',
      );
    }
    return user;
  }

  async getUser(getUserArgs: Partial<User>) {
    return this.usersRepository.findOne(getUserArgs);
  }

  async fetchDetailsFromIterServer(
    regdNo: string,
    password: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const SCRIPT_PATH = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'apps',
          'auth',
          'src',
          'scripts',
          'auth.py',
        );
        const python: ChildProcess = spawn('python3', [
          SCRIPT_PATH,
          regdNo,
          password,
        ]);

        await python.stdout?.on('data', (data: string) => {
          resolve(JSON.parse(data.toString()));
        });

        await python.stderr?.on('data', (data: string) => {
          reject(data.toString());
        });

        await python.on('close', (code: number) => {
          console.log(`child process close all stdio with code ${code}`);
          resolve(null);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async createUserObject(
    rawUser: any,
    password: string,
  ): Promise<CreateUserRequest> {
    const user: CreateUserRequest = {
      email: rawUser.detail[0].semailid,
      regdNo: rawUser.detail[0].enrollmentno,
      name: rawUser.detail[0].name,
      admissionYear: rawUser.detail[0].admissionyear,
      branch:
        rawUser.detail[0].programdesc + ' in ' + rawUser.detail[0].branchdesc,
      dateOfBirth: rawUser.detail[0].dateofbirth,
      gender: rawUser.detail[0].gender,
      primaryPhone: rawUser.detail[0].scellno,
      otherPhones: [rawUser.detail[0].stelephoneno, rawUser.detail[0].pcellno],
      semester: rawUser.detail[0].stynumber,
      section: rawUser.detail[0].sectioncode,
      password: await bcrypt.hash(password, 10),
      status: 'active',
      created_at: new Date().toDateString(),
      updated_at: new Date().toDateString(),
      metadata: null,
    };
    return user;
  }

  async validateOtp(data: {
    regdNo: string;
    otp: number;
  }): Promise<{ statusCode: number; message: string }> {
    try {
      const teacher = await this.teachersRepository.findOne({
        regdNo: data.regdNo,
      });

      if (teacher.status !== 'active') {
        if (data.otp === teacher.metadata.otp) {
          await this.teachersRepository.findOneAndUpdate(
            { regdNo: data.regdNo },
            { status: 'active', metadata: null },
          );
          return { message: 'OTP validated successfully.', statusCode: 200 };
        } else return { message: 'Invalid OTP', statusCode: 401 };
      } else {
        return { message: 'Already verified.', statusCode: 409 };
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
