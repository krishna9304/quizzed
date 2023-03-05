import { IsNotEmpty } from 'class-validator';

export class JoinQuizRequest {
  @IsNotEmpty()
  quiz_id: string;

  @IsNotEmpty()
  student_regdNo: string;
}
