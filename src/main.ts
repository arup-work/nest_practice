import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1'); // This adds "api/v1" before every route

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // React app origin
    credentials: true, // Allow cookies if used 
  })
  
  await app.listen(8000);
}
bootstrap();
