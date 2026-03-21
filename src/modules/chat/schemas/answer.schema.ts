import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnswerDocument = HydratedDocument<Answer>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Answer {
  @Prop({ required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  vehicleOwnerId: number;

  @Prop({ required: true })
  content: string;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
