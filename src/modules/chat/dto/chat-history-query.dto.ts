import { Types } from 'mongoose';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChatHistoryQueryDto {
  @IsNotEmpty()
  vehicleId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  interestedClientId: number;
}
