import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService);
  const port = +configService.get('API_PORT') || 5000;
  await app
    .listen(port)
    .then(() =>
      console.log(`${new Date()} server successfully started on port ${port}`),
    );
}
bootstrap();
