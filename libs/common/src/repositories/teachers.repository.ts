import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../database/abstract.repository';
import { Teacher } from '../schemas/teacher.schema';

@Injectable()
export class TeachersRepository extends AbstractRepository<Teacher> {
  protected readonly logger = new Logger(TeachersRepository.name);

  constructor(
    @InjectModel(Teacher.name) teacherModel: Model<Teacher>,
    @InjectConnection() connection: Connection,
  ) {
    super(teacherModel, connection);
  }
}
