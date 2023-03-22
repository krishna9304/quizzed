import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

export type QuestionsAttemptedDetails = {
  [question_id: string]: number;
};

@Schema({ versionKey: false })
export class Quizstats extends AbstractDocument {
  @Prop({ required: true })
  student_regdNo: string;

  @Prop({ required: true })
  quiz_id: string;

  @Prop({ default: false })
  completed?: boolean;

  @Prop({ default: new Date().toISOString() })
  start_time?: string;

  @Prop({ default: null })
  finish_time?: string;

  @Prop({ default: {}, type: Object })
  questions_attempted_details?: QuestionsAttemptedDetails;

  @Prop({ default: new Date().toISOString() })
  created_at?: string;

  @Prop({ default: new Date().toISOString() })
  updated_at?: string;

  @Prop({ default: null, type: Object })
  metadata?: any;
}

export const QuizstatsSchema = SchemaFactory.createForClass(Quizstats);
