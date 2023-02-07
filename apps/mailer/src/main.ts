import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { MailerModule } from './mailer.module';

async function bootstrap() {
  const app = await NestFactory.create(MailerModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('MAIL'));
  await app.startAllMicroservices();
}
bootstrap();
