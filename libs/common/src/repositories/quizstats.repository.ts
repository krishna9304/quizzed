import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types, MongooseError } from 'mongoose';
import { AbstractRepository } from '../database/abstract.repository';
import { Quizstats } from '../schemas/quizstats.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class QuizStatsRepository extends AbstractRepository<Quizstats> {
  protected readonly logger = new Logger(QuizStatsRepository.name);

  constructor(
    @InjectModel(Quizstats.name) quizStatsModel: Model<Quizstats>,
    @InjectConnection() connection: Connection,
  ) {
    super(quizStatsModel, connection);
  }

  async bulkUpdateQuizStats(quizStatsToUpdate: Quizstats[]): Promise<void> {
    try {
      const bulkOps = quizStatsToUpdate.map((quizStat) => {
        return {
          updateOne: {
            filter: { _id: new Types.ObjectId(quizStat._id) },
            update: {
              completed: true,
              finish_time: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            upsert: true,
          },
        };
      });

      const bulkWriteResult = await this.model.bulkWrite(bulkOps);
      this.logger.debug(
        `Successfully updated ${bulkWriteResult.modifiedCount} quiz stats.`,
      );
    } catch (error) {
      this.logger.error(`Error updating quiz stats: ${error.message}`);
      throw new MongooseError(error.message);
    }
  }

  async getPaginatedPastQuizzesForStudent(user: User, page = 1, limit = 10) {
    return this.model
      .find({
        completed: true,
        student_regdNo: user.regdNo,
      })
      .sort({ updated_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }
}
