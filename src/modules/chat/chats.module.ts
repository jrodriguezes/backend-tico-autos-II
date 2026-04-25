import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Answer, AnswerSchema } from './schemas/answer.schema';
import { Vehicle, VehicleSchema } from '../vehicles/schemas/vehicle.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { AiService } from './ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, AiService],
  exports: [ChatsService],
})
export class ChatsModule {}
