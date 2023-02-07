import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { IsEmail, IsMobilePhone } from 'class-validator';

@Schema({ versionKey: false })
export class Teacher extends AbstractDocument {
  @Prop({ required: true })
  regdNo: string;

  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsMobilePhone('en-IN')
  primaryPhone: string;

  @Prop({ required: false, default: [] })
  subjects: string[];

  @Prop({ default: 'inactive' })
  status: string;

  @Prop({ default: new Date().toDateString() })
  created_at: string;

  @Prop({ default: new Date().toDateString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
