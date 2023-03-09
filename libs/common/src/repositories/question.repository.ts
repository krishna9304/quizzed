import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
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

  async findAllQuestionsByObjectIds(
    user: any,
    questionObjectIds: Types.ObjectId[],
  ) {
    const questions: Array<Question> = await this.model.find({
      _id: { $in: questionObjectIds },
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
