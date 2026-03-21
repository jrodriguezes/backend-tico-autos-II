import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class QuestionDto {
  @IsNumber()
  @IsNotEmpty()
  interestedClientId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
