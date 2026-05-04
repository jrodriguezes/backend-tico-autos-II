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

import { TwilioVerifyService } from 'src/common/twilio-verify.service';

type CompleteGoogleTokenPayload = {
  sub: string;
  stage: 'complete-google';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly twilioVerifyService: TwilioVerifyService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ===========
  // Login con correo/cedula y contraseña
  // ===========

  async login(identifier: string, password: string) {
    const isEmail = identifier.includes('@');

    const user = await this.usersService.findByIdentifierWithHash(identifier);

    if (!user) {
      throw new UnauthorizedException('Creedenciales inválidas');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Esta cuenta no tiene contraseña, por favor inicia sesión con Google',
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException('Creedenciales inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Usuario actualmente no activo. Por favor verifica tu correo para activar tu cuenta.',
      );
    }

    // solo si se inicio con correo => 2FA por SMS
    if (isEmail) {
      if (!user.phoneNumber) {
        throw new UnauthorizedException(
          'No hay telefono registrado para esta cuenta, no se puede usar autenticación de dos factores',
        );
      }

      await this.twilioVerifyService.sendCode(user.phoneNumber);
      await this.usersService.setTwoFactorPending(String(user._id), true);

      return {
        requiresTwoFactor: true,
        userId: String(user._id),
        message: 'Codigo de verificacion enviado via SMS',
      };
    }

    // Si se inicio con cedula => login normal
    //Crear el payload (datos dentro del token)
    const payload = { sub: user._id, numberId: user.numberId, name: user.name }; // "sub" = id del usuario

    // Crear el token (aqui usa el JWT_SECRET y expiresIn)
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  // ===========
  // Login con correo y contraseña, pero el usuario tiene 2FA, entonces se verifica el codigo de 2FA y se le da acceso si es correcto
  // ===========

  async verifyTwoFactor(userId: string, code: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.twoFactorPending) {
      throw new UnauthorizedException(
        'No se requiere verificación de dos factores para este usuario',
      );
    }

    const verificationResult = await this.twilioVerifyService.verifyCode(
      user.phoneNumber,
      code,
    );

    if (verificationResult.status !== 'approved') {
      throw new UnauthorizedException(
        'Invalido o expirado código de verificación',
      );
    }

    await this.usersService.setTwoFactorPending(String(user._id), false);

    const payload = { sub: user._id, numberId: user.numberId };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  // ===========
  // login con Google (OAuth)
  // ===========

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
        'Una cuenta con este correo ya existe. Por favor inicia sesión con ese correo o usa otro método de autenticación.',
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
      throw new UnauthorizedException('Token invalido');
    }

    const currentUser = await this.userModel.findById(payload.sub);

    if (!currentUser) {
      throw new UnauthorizedException('Usuario no encontrado');
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

  // ===========
  // login con correo normal pero el usuario no ha completado su registro porque no ha validado su cuenta,
  // entonces se valida el token temporal y el numero de cedula, y si todo es correcto se completa el registro y se le da acceso
  // ===========

  async validateAccount(numberId: number, token: string) {
    const user = await this.userModel.findOne({ numberId });

    if (!user) {
      throw new UnauthorizedException('Creendenciales inválidas');
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
        'Cuenta ya autenticada o token inválido. Por favor verifica tu correo para activar tu cuenta.',
      );
    }
  }
}
