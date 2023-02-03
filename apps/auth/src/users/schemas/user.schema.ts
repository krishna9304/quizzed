import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { IsEmail, IsMobilePhone, IsStrongPassword } from 'class-validator';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ required: true, length: 10 })
  regdNo: string;

  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @Prop({ required: true })
  @IsMobilePhone('en-IN')
  phone: string;

  @Prop({ required: true, min: 1, max: 8 })
  semester: number;

  @Prop({ required: true, enum: ['CSE', 'CSIT', 'ME', 'CE'] })
  branch: string;

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
