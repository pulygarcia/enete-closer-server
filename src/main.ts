import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) return next();
    return json()(req, res, next);
  });

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: ["http://localhost:5173"],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
