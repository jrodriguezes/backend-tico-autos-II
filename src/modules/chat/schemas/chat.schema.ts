import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Chat {
  @Prop({ required: true })
  vehicleId: Types.ObjectId;

  @Prop({ required: true })
  ownerId: number;

  @Prop({ required: true })
  interestedClientId: number;

  @Prop({ required: true })
  turn: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
