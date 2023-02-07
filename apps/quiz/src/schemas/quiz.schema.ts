import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Types } from 'mongoose';

interface AttemptedQuestions {
  [question_id: string]: boolean;
}
export interface StudentsAppeared {
  [regdNo: string]: AttemptedQuestions;
}

@Schema({ versionKey: false })
export class Quiz extends AbstractDocument {
  @Prop({ required: true, unique: true })
  quiz_id: string;

  @Prop({ required: true })
  conducted_by: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  branch: string;

  @Prop({ required: true, max: 8, min: 1 })
  semester: number;

  @Prop({ required: true, min: 1 })
  total_questions: number;

  @Prop({ required: true })
  per_question_marks: number;

  @Prop({ required: true })
  total_marks: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: false, default: {} })
  total_students_appeared: StudentsAppeared;

  @Prop({ required: false, default: [], ref: 'Question' })
  questions: Types.ObjectId[];

  @Prop({ default: 'inactive' })
  status: string;

  @Prop({ default: new Date().toDateString() })
  created_at: string;

  @Prop({ default: new Date().toDateString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
