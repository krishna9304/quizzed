import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateQuizRequest {
  quiz_id: string;

  conducted_by: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  section: string;

  branch: string;

  @IsNotEmpty()
  @IsNumber()
  @Max(8)
  @Min(1)
  semester: number;

  @IsNotEmpty()
  @IsNumber()
  total_questions: number;

  @IsNotEmpty()
  @IsNumber()
  per_question_marks: number;

  total_marks: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  startTime: string;

  appeared_student_details: Types.ObjectId[];

  questions: string[];

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
