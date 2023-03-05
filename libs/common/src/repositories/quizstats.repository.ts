import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../database/abstract.repository';
import { Quizstats } from '../schemas/quizstats.schema';

@Injectable()
export class QuizStatsRepository extends AbstractRepository<Quizstats> {
  protected readonly logger = new Logger(QuizStatsRepository.name);

  constructor(
    @InjectModel(Quizstats.name) quizStatsModel: Model<Quizstats>,
    @InjectConnection() connection: Connection,
  ) {
    super(quizStatsModel, connection);
  }
}
