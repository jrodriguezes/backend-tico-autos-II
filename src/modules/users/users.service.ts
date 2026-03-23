import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Inyectar el modelo de mongoose
import { Model } from 'mongoose'; // Trabajar modelos mongoose
import { User, UserDocument } from './schemas/user.schema'; // Importamos el esquema de usuario y su tipo de documento
import * as bcrypt from 'bcrypt'; // Para encriptar contraseñas
import { CreateUserDto } from './dto/create-user.dto'; // DTO para crear usuario
import { randomBytes } from 'crypto'; //
import { MailService } from 'src/common/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private mailService: MailService,
  ) {}

  async create(dto: CreateUserDto) {
    const existsUser = await this.userModel.findOne({ numberId: dto.numberId });

    if (existsUser) {
      throw new BadRequestException('User with this numberid already exists');
    }

    const token = randomBytes(32).toString('hex');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.userModel.create({
      numberId: dto.numberId,
      name: dto.name,
      fLastName: dto.fLastName,
      sLastName: dto.sLastName,
      mail: dto.mail,
      phoneNumber: dto.phoneNumber,
      passwordHash,
      verificationToken: token,
    });

    await this.mailService.sendVerificationEmail(createdUser.mail, token);

    return {
      _id: createdUser._id,
      numberId: createdUser.numberId,
      name: createdUser.name,
      fLastName: createdUser.fLastName,
      sLastName: createdUser.sLastName,
      mail: createdUser.mail,
      phoneNumber: createdUser.phoneNumber,
      createdAt: new Date(),
      message: 'Usuario creado, revisa tu correo',
    };
  }

  async findByIdWithHash(numberId: number) {
    return await this.userModel.findOne({ numberId }).select('+passwordHash');
  }

  async getOwnerNameByOwnerId(numberId: number) {
    return await this.userModel.findOne({ numberId: numberId });
  }
}
