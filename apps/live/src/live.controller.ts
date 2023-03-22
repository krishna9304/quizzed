import { RmqService } from '@app/common';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { JoinQuizRequest } from './dto/join-quiz.request';
import { ProgressUpdateQueueRequest } from './dto/submit-answer-update.request';
import { LiveService } from './live.service';

@Controller()
export class LiveController {
  constructor(
    private readonly liveService: LiveService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('join_quiz')
  async joinQuiz(@Payload() data: JoinQuizRequest, @Ctx() context: RmqContext) {
    await this.liveService.createQuizStatsForStudent(data);
    this.rmqService.ack(context);
  }

  @EventPattern('update_progress')
  async updateProgress(
    @Payload() data: ProgressUpdateQueueRequest,
    @Ctx() context: RmqContext,
  ) {
    await this.liveService.updateQuizStats(data);
    this.rmqService.ack(context);
  }
}
