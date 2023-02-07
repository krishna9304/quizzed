import { IsEmail, IsNotEmpty } from 'class-validator';

export class MailRequest {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  otp?: number;
}
