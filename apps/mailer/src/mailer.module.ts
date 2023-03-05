import { AuthModule, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_MAIL_QUEUE: Joi.string().required(),
        MAILER_EMAIL: Joi.string().required(),
        MAILER_PASS: Joi.string().required(),
      }),
    }),
    RmqModule,
    AuthModule,
  ],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
