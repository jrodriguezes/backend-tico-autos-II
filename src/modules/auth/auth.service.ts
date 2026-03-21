// Decorador que permite que la clase sea inyectable dentro del sistema de dependencias de NestJS
// UnauthorizedException es una excepcion HTTP que devuelve un error 401 (No autorizado)
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Servicio de NestJS encargado de generar y verificar JSON Web Tokens (JWT)
// Se utiliza para crear el token cuando el usuario hace login
import { JwtService } from '@nestjs/jwt';

// Libreria para encriptar y comparar contraseñas
// Se usa para verificar que la contraseña ingresada coincida con el hash almacenado en la base de datos
import * as bcrypt from 'bcrypt';

// Servicio del modulo de usuarios
// Se utiliza para buscar y validar informacion del usuario durante el proceso de autenticacion
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(numberId: number, password: string) {
    const user = await this.usersService.findByIdWithHash(numberId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    //Crear el payload (datos dentro del token)
    const payload = { sub: user._id, numberId: user.numberId }; // "sub" = id del usuario

    // Crear el token (aqui usa el JWT_SECRET y expiresIn)
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }
}
