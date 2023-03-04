import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { CreateTeacherRequest } from './dto/create-teacher.request';
import { MAIL_SERVICE } from '@app/common/auth/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { isEmail } from 'class-validator';
import {
  Teacher,
  TeachersRepository,
  User,
  UsersRepository,
} from '@app/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly teachersRepository: TeachersRepository,
    @Inject(MAIL_SERVICE) private mailClient: ClientProxy,
  ) {}

  async createUser(request: CreateUserRequest) {
    await this.validateCreateUserRequest(request);
    const user = await this.usersRepository.create(request);
    delete user.password;
    delete user.metadata;
    return { ...user, type: 'student' };
  }

  async createTeacher(request: CreateTeacherRequest, type = 'teacher') {
    await this.validateCreateUserRequest(request, type);
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    const teacher = await this.teachersRepository.create({
      ...request,
      email: request.email.toLowerCase(),
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
  }

  async validateCreateUserRequest(
    request: Partial<CreateUserRequest | CreateTeacherRequest>,
    type = 'student',
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

  async validateUser(regdNo: string, password: string, type = 'student') {
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

    delete user.password;
    delete user.metadata;
    return { ...user, type };
  }

  async getUser(
    getUserArgs: Partial<User | Teacher>,
    type = 'student',
  ): Promise<User | Teacher | any> {
    const user: User | Teacher = await this[
      type === 'teacher' ? 'teachersRepository' : 'usersRepository'
    ].findOne(getUserArgs);
    delete user.password;
    delete user.metadata;
    return { ...user, type };
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
      email: String(rawUser.detail[0].semailid).toLowerCase(),
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

  async validateAuthOtp(data: {
    regdNo: string;
    otp: number;
  }): Promise<Teacher | any> {
    const teacher = await this.teachersRepository.findOne({
      regdNo: data.regdNo,
    });

    if (teacher.status !== 'active') {
      if (data.otp === teacher.metadata.otp) {
        const updatedDoc: Teacher =
          await this.teachersRepository.findOneAndUpdate(
            { regdNo: data.regdNo },
            { status: 'active', metadata: null },
          );
        delete updatedDoc.password;
        delete updatedDoc.metadata;
        return { ...updatedDoc, type: 'teacher' };
      } else throw new UnauthorizedException('Invalid OTP');
    } else throw new ConflictException('Already verified.');
  }

  async getRegdNo(email: string) {
    if (isEmail(email)) {
      const user = await this.usersRepository.exists({ email });
      if (user) {
        const user = await this.usersRepository.findOne({ email });
        return {
          regdNo: user.regdNo,
          message: 'User found.',
          statusCode: 200,
          error: null,
        };
      }
      const teacher = await this.teachersRepository.exists({ email });
      if (teacher) {
        const teacher = await this.teachersRepository.findOne({ email });
        return {
          regdNo: teacher.regdNo,
          message: 'User found.',
          statusCode: 200,
          error: null,
        };
      } else throw new NotFoundException('No user registered with this email.');
    } else throw new BadRequestException('Invalid email address.');
  }
}
