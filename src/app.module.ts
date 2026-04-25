import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ChatsModule } from './modules/chat/chats.module';
// Permite configurar GraphQL en NestJS
import { GraphQLModule } from '@nestjs/graphql';
// Driver de Apollo para que Nest pueda exponer el endpoint /graphql
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// join se usa para construir la ruta del archivo schema.gql
import { join } from 'path';
import type { Request } from 'express';
@Module({
  imports: [
    DatabaseModule,
    // Configuración global de GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // Indica que GraphQL funcionara con Apollo
      driver: ApolloDriver,
      // Genera automaticamente el esquema GraphQL en este archivo
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Define la ruta donde estara disponible GraphQL
      // Ejemplo: http://localhost:3000/graphql
      path: '/graphql',
      // Habilita el playground de GraphQL para hacer pruebas
      playground: true,
      // Inserta el request HTTP dentro del contexto GraphQL
      // Esto permite reutilizar el mismo token JWT que ya usa REST
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    UsersModule,
    VehiclesModule,
    AuthModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
