import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ChatsModule } from './modules/chat/chats.module';
@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    VehiclesModule,
    AuthModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
