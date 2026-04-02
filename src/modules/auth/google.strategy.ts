import { Injectable } from '@nestjs/common';
// Decorador que permite que NestJS registre esta clase como un provider inyectable.

import { PassportStrategy } from '@nestjs/passport';
// Helper de NestJS para integrar estrategias de Passport dentro del framework.

import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
// Strategy: estrategia OAuth 2.0 de Google.
// Profile: tipo que representa el perfil del usuario autenticado por Google.
// VerifyCallback: callback que Passport usa para finalizar el proceso de autenticación.

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      // ID publico del cliente OAuth generado en Google Cloud.

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Secreto del cliente OAuth, usado para validar la identidad de la aplicacion.

      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      // URL a la que Google redirige al usuario despues de autenticarse.

      scope: ['profile', 'email'],
      // Permisos solicitados a Google para obtener datos basicos del perfil y correo.
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    // Este metodo es llamado por Passport despues de que Google autentica al usuario.
    // Aqui se puede procesar el perfil del usuario y decidir que hacer con el (crear o buscar en la BD).
    const { id, name, emails } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      name: name?.givenName || '',
      fLastName: name?.familyName || '',
    };
    done(null, user);
    // Se llama a done() para indicar que el proceso de validacion ha terminado.
    // El primer argumento es un error (null si no hay error), y el segundo es el usuario autenticado.
  }
}
