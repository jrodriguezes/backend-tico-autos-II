import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Inyectar el modelo de mongoose
import { Model } from 'mongoose'; // Trabajar modelos mongoose
import { User, UserDocument } from './schemas/user.schema'; // Importamos el esquema de usuario y su tipo de documento
import * as bcrypt from 'bcrypt'; // Para encriptar contraseñas
import { CreateUserDto } from './dto/create-user.dto'; // DTO para crear usuario

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto) {
    const existsUser = await this.userModel.findOne({ numberId: dto.numberId });

    if (existsUser) {
      throw new BadRequestException('User with this numberid already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.userModel.create({
      numberId: dto.numberId,
      name: dto.name,
      passwordHash,
    });

    return {
      _id: createdUser._id,
      numberId: createdUser.numberId,
      name: createdUser.name,
      createdAt: new Date(),
    };
  }

  async findByIdWithHash(numberId: number) {
    return await this.userModel.findOne({ numberId }).select('+passwordHash');
  }

  async getOwnerNameByOwnerId(numberId: number) {
    return await this.userModel.findOne({ numberId: numberId });
  }
}
