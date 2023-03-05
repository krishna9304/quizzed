import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository, Quiz, quiz_status } from '@app/common';

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
}
