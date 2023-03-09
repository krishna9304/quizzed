import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository, Quiz, quiz_status, Teacher } from '@app/common';

@Injectable()
export class QuizRepository extends AbstractRepository<Quiz> {
  protected readonly logger = new Logger(QuizRepository.name);

  constructor(
    @InjectModel(Quiz.name) quizModel: Model<Quiz>,
    @InjectConnection() connection: Connection,
  ) {
    super(quizModel, connection);
  }

  async getLastQuizId(): Promise<number> {
    const lastQuiz = await this.model
      .findOne({}, {}, { sort: { _id: -1 } })
      .lean();
    return lastQuiz ? Number(lastQuiz.quiz_id.split('_')[1]) : 0;
  }

  async findAllLiveQuizzes(): Promise<Quiz[]> {
    return this.model.find({ status: quiz_status.LIVE }).exec();
  }

  async getPaginatedQuizzesForTeacher(
    user: Teacher,
    status: string,
    page = 1,
    limit = 10,
  ): Promise<Quiz[]> {
    return this.model
      .find({
        conducted_by: user.regdNo,
        status,
      })
      .sort({ updated_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  async findByQuizIdAndDelete(quiz_id) {
    return this.model.findOneAndDelete({ quiz_id });
  }
}
