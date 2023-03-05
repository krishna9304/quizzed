import { QuizRepository, QuizStatsRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { JoinQuizRequest } from './dto/join-quiz.request';

@Injectable()
export class LiveService {
  constructor(
    private readonly quizStatsRepository: QuizStatsRepository,
    private readonly quizRepository: QuizRepository,
  ) {}

  private readonly logger = new Logger(LiveService.name);

  async createQuizStatsForStudent(data: JoinQuizRequest) {
    const quizStats = await this.quizStatsRepository.create(data);
    await this.quizRepository.findOneAndUpdate(
      { quiz_id: data.quiz_id },
      {
        $push: { appeared_student_details: quizStats._id },
        updated_at: new Date().toISOString(),
      },
    );
    this.logger.log(`${data.student_regdNo} joined quiz ${data.quiz_id}`);
  }
}
