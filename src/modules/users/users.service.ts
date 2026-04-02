import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Inyectar el modelo de mongoose
import { Model, Types } from 'mongoose'; // Trabajar modelos mongoose
import { User, UserDocument } from './schemas/user.schema'; // Importamos el esquema de usuario y su tipo de documento
import * as bcrypt from 'bcrypt'; // Para encriptar contraseñas
import { CreateUserDto } from './dto/create-user.dto'; // DTO para crear usuario
import { randomBytes } from 'crypto'; //
import { MailService } from 'src/common/mail.service';

type PadronPerson = {
  cedula: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  vencimiento: number;
};

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
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      passwordHash,
      verificationToken: token,
    });

    await this.mailService.sendVerificationEmail(
      createdUser.email,
      token,
      dto.numberId,
    );

    return {
      _id: createdUser._id,
      numberId: createdUser.numberId,
      name: createdUser.name,
      fLastName: createdUser.fLastName,
      sLastName: createdUser.sLastName,
      email: createdUser.email,
      phoneNumber: createdUser.phoneNumber,
      createdAt: new Date(),
      message: 'Usuario creado, revisa tu correo',
    };
  }

  async findByIdentifierWithHash(identifier: string) {
    const isEmail = identifier.includes('@');

    if (isEmail) {
      return await this.userModel
        .findOne({ email: identifier })
        .select('+passwordHash');
    }

    return await this.userModel
      .findOne({ numberId: Number(identifier) })
      .select('+passwordHash');
  }

  async getOwnerNameByOwnerId(numberId: number) {
    return await this.userModel.findOne({ numberId: numberId });
  }

  async findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId });
  }

  async findByMail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async createGooglePendingUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    fLastName: string;
  }) {
    return this.userModel.create({
      googleId: googleUser.googleId,
      email: googleUser.email.toLowerCase(),
      name: googleUser.name,
      fLastName: googleUser.fLastName,
      sLastName: '',
      authProvider: 'google',
      status: 'pending',
      numberIdValidated: false,
    });
  }

  async completeGoogleUser(
    id: string,
    data: {
      numberId: number;
      name: string;
      fLastName: string;
      sLastName: string;
      status: string;
      numberIdValidated: boolean;
    },
  ) {
    return this.userModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });
  }

  async findByMongoId(id: Types.ObjectId) {
    return this.userModel.findById(id);
  }

  async findByNumberId(numberId: number) {
    return this.userModel.findOne({ numberId });
  }

  async lookupPadron(numberId: number): Promise<PadronPerson | null> {
    try {
      const response = await fetch(`http://padron.com/cedula/${numberId}`);

      if (!response.ok) {
        return null;
      }

      const data: unknown = await response.json();

      // Si el backend devuelve ["No encontrado"]
      if (Array.isArray(data)) {
        return null;
      }

      // Validación mínima de que sí venga con forma esperada
      if (
        typeof data === 'object' &&
        data !== null &&
        'cedula' in data &&
        'nombre' in data &&
        'apellidoPaterno' in data &&
        'apellidoMaterno' in data
      ) {
        return data as PadronPerson;
      }

      return null;
    } catch (error) {
      console.error('Error consultando padrón:', error);
      return null;
    }
  }
}
