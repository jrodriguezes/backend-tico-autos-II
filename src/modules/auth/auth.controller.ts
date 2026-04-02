import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { identifier: string; password: string }) {
    return this.authService.login(body.identifier, body.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Este endpoint inicia el proceso de autenticacion con Google.
    // El guard de Passport redirigira al usuario a la página de login de Google.
    // No es necesario implementar nada aqui, ya que el guard se encarga de todo el proceso de redireccion y autenticacion.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req()
    req: {
      user: {
        googleId: string;
        email: string;
        name: string;
        fLastName: string;
      };
    },
    @Res() res: Response,
  ) {
    const result = await this.authService.handleGoogleLogin(req.user);

    if (result.requiresNumberId) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/google-complete?tempToken=${result.tempToken}`,
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/home?token=${result.access_token}`,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: { user: { numberId: number } }) {
    return req.user;
  }

  @Patch('validate-email')
  validateEmail(@Query('token') token: string, @Query('id') numberId: number) {
    return this.authService.validateAccount(numberId, token);
  }

  @Post('complete-google-registration')
  completeGoogleRegistration(
    @Body() body: { tempToken: string; numberId: number },
  ) {
    return this.authService.completeGoogleRegistration(
      body.tempToken,
      body.numberId,
    );
  }
}
