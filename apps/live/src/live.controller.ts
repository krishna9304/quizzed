import { RmqService } from '@app/common';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { JoinQuizRequest } from './dto/join-quiz.request';
import { LiveService } from './live.service';

@Controller()
export class LiveController {
  constructor(
    private readonly liveService: LiveService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('join_quiz')
  async sendOtp(@Payload() data: JoinQuizRequest, @Ctx() context: RmqContext) {
    console.log(data);
    this.rmqService.ack(context);
  }
}
