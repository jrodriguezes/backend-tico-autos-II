import { Chat, ChatDocument } from './schemas/chat.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { Vehicle, VehicleDocument } from '../vehicles/schemas/vehicle.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ChatDto } from './dto/chat.dto';
import { QuestionDto } from './dto/question.dto';
import { AnswerDto } from './dto/answer.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatHistoryQueryDto } from './dto/chat-history-query.dto';
import { AiService } from './ai.service';

type InboxItem = {
  chatId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  vehiclePlate: string;
  ownerId: number;
  ownerName: string;
  interestedClientId: number;
  interestedClientName: string;
};

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,

    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,

    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,

    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly aiService: AiService,
  ) {}

  async changeStatus(
    chatId: Types.ObjectId,
    questionId: Types.ObjectId,
    status: string,
  ) {
    if (status == 'owner') {
      const questionStatus = await this.changeQuestionStatus(
        questionId,
        'waiting',
      );
      const chatStatus = await this.changeChatStatus(chatId, 'client');

      return {
        chatStatus,
        questionStatus,
      };
    } else if (status == 'client') {
      const questionStatus = await this.changeQuestionStatus(
        questionId,
        'available',
      );
      const chatStatus = await this.changeChatStatus(chatId, 'owner');

      return {
        chatStatus,
        questionStatus,
      };
    }
  }

  async changeChatStatus(_id: Types.ObjectId, turn: string) {
    const changedStatus = await this.chatModel.findOneAndUpdate(_id, {
      turn: turn,
    });

    return changedStatus;
  }

  async changeQuestionStatus(_id: Types.ObjectId, status: string) {
    const changedStatus = await this.questionModel.findByIdAndUpdate(_id, {
      status: status,
    });

    return changedStatus;
  }

  async handleChatMessage(
    chatDto: ChatDto,
    questionDto?: QuestionDto,
    answerDto?: AnswerDto,
  ) {
    // 1. Validaciones basicas de entrada
    if (!questionDto && !answerDto) {
      throw new Error('Debes enviar una pregunta o una respuesta');
    }

    if (questionDto && answerDto) {
      throw new Error(
        'No puedes enviar pregunta y respuesta en la misma petición',
      );
    }

    // 2. NUEVA LOGICA DE IA: VALIDACION DE CONTENIDO

    // Extraemos el texto que vamos a enviar (sea de la pregunta o de la respuesta)
    const textToValidate = questionDto?.content || answerDto?.content || '';

    // Llamamos a la IA para validar el mensaje
    const isSafe = await this.aiService.validateMessage(textToValidate);

    // Si la IA detecta datos de contacto, lanzamos el error de inmediato
    if (!isSafe) {
      throw new Error(
        'Mensaje bloqueado: No se permite compartir información de contacto (teléfonos, emails, etc). Por favor usa la plataforma para negociar.',
      );
    }

    // 3. Continuar con la lógica normal de chat
    const existingChat = await this.chatModel.findOne({
      vehicleId: chatDto.vehicleId,
      interestedClientId: chatDto.interestedClientId,
    });

    if (existingChat) {
      const lastQuestion = await this.getLastQuestion(existingChat._id);

      if (!lastQuestion) {
        throw new Error('No se encontro una pregunta para este chat');
      }

      if (answerDto) {
        if (existingChat.ownerId != answerDto.vehicleOwnerId) {
          throw new Error('Solo el propietario del vehiculo puede responder');
        }

        if (existingChat.turn != 'owner') {
          throw new Error(
            'No se ha podido realizar la peticion. Debe esperar a que el cliente escriba primero',
          );
        }

        const answer = await this.createAnswer(lastQuestion._id, answerDto);

        const changedStatus = await this.changeStatus(
          existingChat._id,
          lastQuestion._id,
          'owner',
        );

        return {
          answer,
          changedStatus,
        };
      }

      if (questionDto) {
        if (existingChat.interestedClientId != questionDto.interestedClientId) {
          throw new Error(
            'Solo el usuario interesado de este chat puede preguntar',
          );
        }
        if (existingChat.turn !== 'client') {
          throw new Error(
            'No se ha podido realizar la peticion. Debe esperar a que el dueño del vehiculo responda primero',
          );
        }
        const question = await this.createQuestion(
          existingChat._id,
          questionDto,
        );
        const changedStatus = await this.changeStatus(
          existingChat._id,
          question._id,
          'client',
        );

        return {
          question,
          changedStatus,
        };
      }
    }
    if (!questionDto) {
      throw new Error('Para iniciar un chat debes enviar una pregunta');
    }

    const chatResponse = await this.createChat(chatDto);

    const questionResponse = await this.createQuestion(
      chatResponse._id,
      questionDto,
    );

    return {
      chatResponse,
      questionResponse,
    };
  }

  async createChat(dto: ChatDto) {
    const createdChat = await this.chatModel.create({
      vehicleId: dto.vehicleId,
      ownerId: dto.ownerId,
      interestedClientId: dto.interestedClientId,
      turn: 'owner',
    });

    return createdChat;
  }

  async createQuestion(chatId: Types.ObjectId, dto: QuestionDto) {
    const createdQuestion = await this.questionModel.create({
      chatId: chatId,
      interestedClientId: dto.interestedClientId,
      content: dto.content,
      status: 'waiting',
    });

    return createdQuestion;
  }

  async createAnswer(questionId: Types.ObjectId, dto: AnswerDto) {
    const createdAnswer = await this.answerModel.create({
      questionId: questionId,
      vehicleOwnerId: dto.vehicleOwnerId,
      content: dto.content,
    });

    return createdAnswer;
  }

  async getChat(vehicleId: Types.ObjectId, interestedClientId: number) {
    const chatData = await this.chatModel.findOne({
      vehicleId: vehicleId,
      interestedClientId: interestedClientId,
    });
    return chatData;
  }

  async getLastQuestion(chatId: Types.ObjectId | string) {
    let queryChatId = chatId;
    if (typeof chatId === 'string') {
      queryChatId = new Types.ObjectId(chatId);
    }
    const lastQuestion = await this.questionModel
      .findOne({ chatId: queryChatId })
      .sort({ createdAt: -1 });

    return lastQuestion;
  }

  async getChatHistoryByVehicle(dto: ChatHistoryQueryDto) {
    const getChat = await this.chatModel.findOne({
      vehicleId: dto.vehicleId,
      interestedClientId: dto.interestedClientId,
    });

    if (!getChat) {
      return [];
    }

    const getQuestions = await this.questionModel.find({
      chatId: getChat._id,
    });

    const chatHistory: Array<{
      question: QuestionDocument;
      answer: AnswerDocument | null;
    }> = [];

    for (const question of getQuestions) {
      const answer = await this.answerModel.findOne({
        questionId: question._id,
      });
      chatHistory.push({ question, answer });
    }

    return chatHistory;
  }
  async getInbox(currentUserId: number): Promise<InboxItem[]> {
    const chats = await this.chatModel.find({
      $or: [{ ownerId: currentUserId }, { interestedClientId: currentUserId }],
    });

    const result: InboxItem[] = [];

    for (const chat of chats) {
      const vehicle = await this.vehicleModel.findById(chat.vehicleId);
      const owner = await this.userModel.findOne({ numberId: chat.ownerId });
      const client = await this.userModel.findOne({
        numberId: chat.interestedClientId,
      });

      result.push({
        chatId: chat._id,
        vehicleId: chat.vehicleId,
        vehiclePlate: vehicle?.plateId || 'Sin placa',
        ownerId: chat.ownerId,
        ownerName: owner?.name || `Owner ${chat.ownerId}`,
        interestedClientId: chat.interestedClientId,
        interestedClientName:
          client?.name || `Cliente ${chat.interestedClientId}`,
      });
    }

    return result;
  }
}
