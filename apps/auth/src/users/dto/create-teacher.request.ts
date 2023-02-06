import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  regdNo: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMobilePhone('en-IN')
  primaryPhone: string;

  subjects: string[];

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
