import { RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { LiveModule } from './live.module';

async function bootstrap() {
  const app = await NestFactory.create(LiveModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('LIVE'));
  await app.startAllMicroservices();
}
bootstrap();
