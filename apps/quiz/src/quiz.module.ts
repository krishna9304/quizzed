import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  AuthModule,
  AzureBlobUtil,
  DatabaseModule,
  HttpExceptionFilter,
  Question,
  QuestionRepository,
  QuestionSchema,
  Quiz,
  QuizRepository,
  QuizSchema,
  Quizstats,
  QuizStatsRepository,
  QuizstatsSchema,
  RmqModule,
  User,
  UserSchema,
  UsersRepository,
  UtilModule,
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { UsersModule } from 'apps/auth/src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
    MongooseModule.forFeature([
      { name: Quizstats.name, schema: QuizstatsSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        AZURE_BLOB_CONNECTION_STRING: Joi.string().required(),
        AZURE_BLOB_CONTAINER_NAME: Joi.string().required(),
      }),
      envFilePath: './apps/quiz/.env',
    }),
    DatabaseModule,
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    AuthModule,
    UtilModule,
  ],
  controllers: [QuizController],
  providers: [
    QuizService,
    QuizRepository,
    QuestionRepository,
    QuizStatsRepository,
    UsersRepository,
    AzureBlobUtil,
    { provide: 'HTTP_EXCEPTION_FILTER', useClass: HttpExceptionFilter },
  ],
})
export class QuizModule {}
