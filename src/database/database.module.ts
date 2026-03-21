import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule carga las variables de mi .env, configservice me permite acceder a ellos

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Cargar el archivo .env globalmente
    // Configuracion async. Espera a que los datos de .env esten disponibles
    MongooseModule.forRootAsync({
      inject: [ConfigService], // Inyectamos configservice a useFactory para acceder a las variables de entorno
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),
    }),
  ],
})
export class DatabaseModule {}
