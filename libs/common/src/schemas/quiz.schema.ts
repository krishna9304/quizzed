import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Types } from 'mongoose';

export const quiz_status = {
  DRAFT: 'draft',
  LIVE: 'live',
  COMPLETED: 'completed',
};

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

  @Prop({ default: null })
  startTime: string;

  @Prop({ required: false, default: [], ref: 'Quizstats' })
  appeared_student_details: Types.ObjectId[];

  @Prop({ required: false, default: [], ref: 'Question' })
  questions: Types.ObjectId[];

  @Prop({ default: quiz_status.DRAFT })
  status: string;

  @Prop({ default: new Date().toISOString() })
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
