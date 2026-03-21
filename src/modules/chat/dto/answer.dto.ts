import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AnswerDto {
  @IsNotEmpty()
  questionId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  vehicleOwnerId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
