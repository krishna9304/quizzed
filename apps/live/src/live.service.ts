import { QuizRepository, QuizStatsRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { JoinQuizRequest } from './dto/join-quiz.request';
import { ProgressUpdateQueueRequest } from './dto/submit-answer-update.request';

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

  async updateQuizStats(data: ProgressUpdateQueueRequest) {
    await this.quizStatsRepository.findOneAndUpdate(
      { student_regdNo: data.student_regdNo, quiz_id: data.quiz_id },
      {
        questions_attempted_details: data.questions_attempted_details,
        updated_at: new Date().toISOString(),
      },
    );
    this.logger.log(
      `Quizstats progress updated for student - ${data.student_regdNo}`,
    );
  }
}
