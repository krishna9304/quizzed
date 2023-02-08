import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(3)
  correct_option: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  created_by: string;

  created_at: string;

  updated_at: string;
}
