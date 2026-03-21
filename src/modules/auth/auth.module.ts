import { Module } from '@nestjs/common';
// Modulo que permite generar y verificar JSON Web Tokens (JWT)
// Se usa para firmar el token al hacer login y validarlo en rutas protegidas
import { JwtModule } from '@nestjs/jwt';

// Moddulo que integra Passport.js con NestJS
// Permite utilizar estrategias de autenticacion (como JWT) mediante guards
import { PassportModule } from '@nestjs/passport';

// Modulo que contiene la logica y servicios relacionados con usuarios
// Se importa para poder acceder al UsersService durante el proceso de autenticacion
import { UsersModule } from '../users/users.module';

// Servicio que contiene la logica de autenticacion
// Se encarga de validar credenciales y generar el token JWT
import { AuthService } from './auth.service';

// Controlador que define los endpoints de autenticacion,
// por ejemplo: POST /auth/login
import { AuthController } from './auth.controller';

// Estrategia de Passport para validar tokens JWT
// Se encarga de verificar que el token enviado en el header Authorization sea valido
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      // Configura JwtService con estas reglas por defecto para crear y verificar tokens
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
