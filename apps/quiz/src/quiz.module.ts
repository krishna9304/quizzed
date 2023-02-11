import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  AuthModule,
  AzureBlobStorageMiddleware,
  DatabaseModule,
  MiddlewareModule,
  RmqModule,
  S3StorageMiddleware,
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizRepository } from './repositories/quiz.repository';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuestionRepository } from './repositories/question.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
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
    MongooseModule.forFeature([]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    AuthModule,
    MiddlewareModule,
  ],
  controllers: [QuizController],
  providers: [
    QuizService,
    QuizRepository,
    QuestionRepository,
    AzureBlobStorageMiddleware,
    S3StorageMiddleware,
  ],
})
export class QuizModule {}
