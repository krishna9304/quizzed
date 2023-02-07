import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { TeachersRepository } from './teachers.repository';
import { Teacher, TeacherSchema } from './schemas/teacher.schema';
import { AuthModule, RmqModule } from '@app/common';
import { MAIL_SERVICE } from '@app/common/auth/services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    AuthModule,
    RmqModule.register({
      name: MAIL_SERVICE,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, TeachersRepository],
  exports: [UsersService],
})
export class UsersModule {}
