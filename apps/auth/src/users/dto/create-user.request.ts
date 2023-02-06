import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  regdNo: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMobilePhone('en-IN')
  primaryPhone: string;

  otherPhones: string[];

  @IsNumber({ maxDecimalPlaces: 1 })
  semester: number;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsString()
  @IsNotEmpty()
  admissionYear: string;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsNotEmpty()
  dateOfBirth: string;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
