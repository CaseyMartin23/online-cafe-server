import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: [process.env.CLIENT_BASE_URL, process.env.DASHBOARD_BASE_URL] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.getHttpAdapter().getInstance().disable("x-powered-by");
  await app.listen(port);
}
bootstrap();
