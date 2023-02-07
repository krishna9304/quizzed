import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { IsEmail, IsMobilePhone } from 'class-validator';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ required: true })
  regdNo: string;

  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsMobilePhone('en-IN')
  primaryPhone: string;

  @Prop({ required: false, default: [] })
  otherPhones: string[];

  @Prop({ required: true, min: 1, max: 8 })
  semester: number;

  @Prop({ required: true })
  branch: string;

  @Prop({ required: true })
  admissionYear: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: new Date().toDateString() })
  created_at: string;

  @Prop({ default: new Date().toDateString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const UserSchema = SchemaFactory.createForClass(User);
