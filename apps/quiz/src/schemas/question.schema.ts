import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class Question extends AbstractDocument {
  @Prop({ required: true, unique: true })
  question_id: string;

  @Prop({ required: true })
  question_str: string;

  @Prop({ required: false, default: null })
  question_img: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correct_option: number;

  @Prop({ required: true })
  subject: string;

  @Prop({ default: new Date().toDateString() })
  created_at: string;

  @Prop({ default: new Date().toDateString() })
  updated_at: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
