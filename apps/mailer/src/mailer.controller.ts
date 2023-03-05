import { RmqService } from '@app/common';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MailRequest } from './dto/mail.request';
import { MailerService } from './mailer.service';

@Controller()
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('teacher_registered')
  async sendOtp(@Payload() data: MailRequest, @Ctx() context: RmqContext) {
    await this.mailerService.mail(data);
    this.rmqService.ack(context);
  }
}
