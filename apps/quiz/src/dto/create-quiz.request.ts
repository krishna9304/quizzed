import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { StudentsAppeared } from '../schemas/quiz.schema';

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

  total_students_appeared: StudentsAppeared;

  questions: Types.ObjectId[];

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
