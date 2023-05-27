import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthModule,
  MailerModule,
  MailerService,
  Teacher,
  TeacherSchema,
  TeachersRepository,
  User,
  UserSchema,
  UsersRepository,
} from '@app/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    AuthModule,
    MailerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, TeachersRepository, MailerService],
  exports: [UsersService],
})
export class UsersModule {}
