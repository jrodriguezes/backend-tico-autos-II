import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Question {
  @Prop({ required: true })
  chatId: Types.ObjectId;

  @Prop({ required: true })
  interestedClientId: number;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  status: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
