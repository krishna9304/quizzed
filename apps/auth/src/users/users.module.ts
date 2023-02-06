import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { Teacher, TeacherSchema } from './schemas/teacher.schema';
import { TeachersRepository } from './teachers.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, TeachersRepository],
  exports: [UsersService],
})
export class UsersModule {}
