import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Si alguien pide una imagen, automaticante lo buscara en upload, ya que tenemos la imagen en el servidor, pero no es una url publica
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
