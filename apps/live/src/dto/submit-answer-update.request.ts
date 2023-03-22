import { QuestionsAttemptedDetails } from '@app/common';
import { IsNotEmpty, IsObject } from 'class-validator';

export class ProgressUpdateQueueRequest {
  @IsNotEmpty()
  quiz_id: string;

  @IsNotEmpty()
  student_regdNo: string;

  @IsObject()
  questions_attempted_details: QuestionsAttemptedDetails;
}
