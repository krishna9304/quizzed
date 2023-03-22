import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCorrectOption' })
export class IsCorrectOption implements ValidatorConstraintInterface {
  validate(value: string) {
    return ['0', '1', '2', '3'].includes(value);
  }
}
export class CreateQuestionRequest {
  question_id: string;

  @IsString()
  @IsNotEmpty()
  question_str: string;

  question_img: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(4)
  @ArrayMinSize(2)
  options: string[];

  @IsNotEmpty()
  @IsNumberString()
  @Validate(IsCorrectOption, {
    message: 'correct_option must be one of: 0, 1, 2, 3',
  })
  correct_option: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  created_by: string;

  created_at: string;

  updated_at: string;
}
