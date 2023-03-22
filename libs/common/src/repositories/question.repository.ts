import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository, Question } from '@app/common';

@Injectable()
export class QuestionRepository extends AbstractRepository<Question> {
  protected readonly logger = new Logger(QuestionRepository.name);

  constructor(
    @InjectModel(Question.name) questionModel: Model<Question>,
    @InjectConnection() connection: Connection,
  ) {
    super(questionModel, connection);
  }

  async findAllQuestionsByQsnIds(user: any, questionIds: string[]) {
    const questions: Array<Question> = await this.model.find({
      question_id: { $in: questionIds },
    });
    if (user.type === 'student') {
      return questions.map((ques) => {
        ques.correct_option = null;
        return ques;
      });
    }
    return questions;
  }
}
