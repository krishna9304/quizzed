import {
  AuthModule,
  DatabaseModule,
  Quiz,
  QuizRepository,
  QuizSchema,
  RmqModule,
} from '@app/common';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/live/.env',
    }),
    DatabaseModule,
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    AuthModule,
  ],
  controllers: [LiveController],
  providers: [LiveService, QuizRepository],
})
export class LiveModule {}
