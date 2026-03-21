import { AuthGuard } from '@nestjs/passport';
import { ChatsService } from './chats.service';
import {
  Get,
  Body,
  Post,
  Query,
  Controller,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HandleChatMessageDto } from './dto/handle-chat-message.dto';
import { ChatHistoryQueryDto } from './dto/chat-history-query.dto';
import { Types } from 'mongoose';

type ReqUser = {
  userId: string;
  numberId: number;
  name: string;
};

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  getChatHistory(@Query() query: ChatHistoryQueryDto) {
    return this.chatsService.getChatHistoryByVehicle(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('message')
  handleChatMessage(@Body() Body: HandleChatMessageDto) {
    return this.chatsService.handleChatMessage(
      Body.chat,
      Body.question,
      Body.answer,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getChat(
    @Query('vehicleId') vehicleId: Types.ObjectId,
    @Query('interestedClientId') interestedClientId: string,
  ) {
    return this.chatsService.getChat(vehicleId, Number(interestedClientId));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('lastQuestion')
  getLastQuestion(@Query('chatId') chatId: Types.ObjectId) {
    return this.chatsService.getLastQuestion(chatId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('inbox')
  getInbox(@Req() req: { user: ReqUser }) {
    return this.chatsService.getInbox(req.user.numberId);
  }
}
