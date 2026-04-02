// Decorador que permite que la clase sea inyectable dentro del sistema de dependencias de NestJS
// UnauthorizedException es una excepcion HTTP que devuelve un error 401 (No autorizado)
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Servicio de NestJS encargado de generar y verificar JSON Web Tokens (JWT)
// Se utiliza para crear el token cuando el usuario hace login
import { JwtService } from '@nestjs/jwt';

// Libreria para encriptar y comparar contraseñas
// Se usa para verificar que la contraseña ingresada coincida con el hash almacenado en la base de datos
import * as bcrypt from 'bcrypt';

// Servicio del modulo de usuarios
// Se utiliza para buscar y validar informacion del usuario durante el proceso de autenticacion
import { UsersService } from '../users/users.service';

import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';

import { Model } from 'mongoose';

type CompleteGoogleTokenPayload = {
  sub: string;
  stage: 'complete-google';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async login(identifier: string, password: string) {
    const user = await this.usersService.findByIdentifierWithHash(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account must sign in with Google');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User not currently active');
    }

    //Crear el payload (datos dentro del token)
    const payload = { sub: user._id, numberId: user.numberId }; // "sub" = id del usuario

    // Crear el token (aqui usa el JWT_SECRET y expiresIn)
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  async validateAccount(numberId: number, token: string) {
    const user = await this.userModel.findOne({ numberId });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.verificationToken == token) {
      const verifiedUser = await this.userModel.findOneAndUpdate(
        { numberId },
        {
          verificationToken: '',
          status: 'active',
        },
        { returnDocument: 'after' },
      );

      return verifiedUser;
    } else {
      throw new UnauthorizedException(
        'Account already authenticated or invalid token',
      );
    }
  }

  async handleGoogleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    fLastName: string;
  }) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) {
      if (!user.numberIdValidated || user.status !== 'active') {
        const tempToken = await this.jwtService.signAsync(
          { sub: user._id, numberId: user.numberId },
          { expiresIn: '15m' },
        );

        return { requiresNumberId: true, tempToken };
      }

      const access_token = await this.jwtService.signAsync({
        sub: user._id,
        numberId: user.numberId,
      });
      return { access_token };
    }
    const existingMail = await this.usersService.findByMail(googleUser.email);

    if (existingMail) {
      throw new BadRequestException(
        'An account with this email already exists. Please login with your credentials.',
      );
    }

    user = await this.usersService.createGooglePendingUser(googleUser);

    const tempToken = await this.jwtService.signAsync(
      { sub: user._id, stage: 'complete-google' },
      { expiresIn: '15m' },
    );

    return { requiresNumberId: true, tempToken };
  }

  async completeGoogleRegistration(tempToken: string, numberId: number) {
    const payload =
      await this.jwtService.verifyAsync<CompleteGoogleTokenPayload>(tempToken);

    if (payload.stage !== 'complete-google') {
      throw new UnauthorizedException('Invalid token');
    }

    const currentUser = await this.userModel.findById(payload.sub);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const existsNumberId = await this.usersService.findByNumberId(numberId);
    if (
      existsNumberId &&
      String(existsNumberId._id) !== String(currentUser._id)
    ) {
      throw new BadRequestException('La cédula ya está registrada');
    }

    const person = await this.usersService.lookupPadron(numberId);

    if (!person) {
      throw new BadRequestException('La cédula no existe en el padrón');
    }

    const updatedUser = await this.usersService.completeGoogleUser(
      String(currentUser._id),
      {
        numberId,
        name: person.nombre,
        fLastName: person.apellidoPaterno,
        sLastName: person.apellidoMaterno,
        status: 'active',
        numberIdValidated: true,
      },
    );

    if (!updatedUser) {
      throw new UnauthorizedException('No se pudo completar el registro');
    }

    const access_token = await this.jwtService.signAsync({
      sub: updatedUser._id,
      numberId: updatedUser.numberId,
    });

    return { access_token };
  }
}
