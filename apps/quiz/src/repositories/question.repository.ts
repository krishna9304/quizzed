import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { Question } from '../schemas/question.schema';

@Injectable()
export class QuestionRepository extends AbstractRepository<Question> {
  protected readonly logger = new Logger(QuestionRepository.name);

  constructor(
    @InjectModel(Question.name) questionModel: Model<Question>,
    @InjectConnection() connection: Connection,
  ) {
    super(questionModel, connection);
  }
}
