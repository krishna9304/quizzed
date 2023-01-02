import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SERVICE } from './constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/quizzed-main/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
