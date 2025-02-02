import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // Enable CORS for your frontend's origin (localhost:5173)
   app.enableCors({
    origin: 'http://localhost:5173',  // Allow requests from React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization',  // Allowed headers
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
