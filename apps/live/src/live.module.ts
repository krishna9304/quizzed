import {
  AuthModule,
  DatabaseModule,
  Quiz,
  QuizRepository,
  QuizSchema,
  Quizstats,
  QuizStatsRepository,
  QuizstatsSchema,
  RmqModule,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MongooseModule.forFeature([
      { name: Quizstats.name, schema: QuizstatsSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_LIVE_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/live/.env',
    }),
    DatabaseModule,
    RmqModule,
    AuthModule,
  ],
  controllers: [LiveController],
  providers: [LiveService, QuizRepository, QuizStatsRepository],
})
export class LiveModule {}
