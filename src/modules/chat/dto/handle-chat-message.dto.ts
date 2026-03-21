import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ChatDto } from './chat.dto';
import { QuestionDto } from './question.dto';
import { AnswerDto } from './answer.dto';

export class HandleChatMessageDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ChatDto)
  chat: ChatDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuestionDto)
  question: QuestionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AnswerDto)
  answer: AnswerDto;
}
