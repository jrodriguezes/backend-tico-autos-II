import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Modulos que deben ser importados dentro de este modulo. forFeature se utiiliza
    // para registrar esquemas de Mongoose
  ], // Lo que module hace es, acceso a lo que otros modulos hacen o exportan por ejemplo el Schema de la BD
  controllers: [UsersController], // Se registra los controladores que manejan las solicitudes HTTP.
  providers: [UsersService], // Servicios y otras dependencias que proveen funcionalidades dentro del modulo.
  exports: [UsersService], // Se registra los componentes que debe compartir este modulo con otros modulos.
})
export class UsersModule {}
