import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ChatDto {
  @IsNotEmpty()
  vehicleId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @IsNumber()
  @IsNotEmpty()
  interestedClientId: number;

  @IsString()
  @IsNotEmpty()
  turn: string;
}
