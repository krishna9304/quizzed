import { QuestionsAttemptedDetails } from '@app/common';
import { IsObject } from 'class-validator';

export class UpdateProgressRequest {
  @IsObject()
  questions_attempted_details: QuestionsAttemptedDetails;
}
