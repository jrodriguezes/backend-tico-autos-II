import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  numberId: number;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // se saca el token (del header Authorization: Bearer)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // se utiliza la misma clave secreta(JWT_SECRET) para verificar que el token sea valido
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }
  // si la firma y expiracion son validas, Passport llama validate()
  validate(payload: JwtPayload) {
    // lo que se retorna aqui, queda en req.user
    return {
      userId: payload.sub,
      numberId: payload.numberId,
      name: payload.name,
    };
  }
}
