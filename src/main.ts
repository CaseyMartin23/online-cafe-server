import { NestFactory } from '@nestjs/core';
import * as cookieParser from "cookie-parser";
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3223;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: [process.env.CLIENT_BASE_URL, process.env.DASHBOARD_BASE_URL] })
  app.use(cookieParser())
  await app.listen(port);
}
bootstrap();
