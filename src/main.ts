import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Projects API')
    .setDescription('API for managing projects')
    .setVersion('1.0')
    .build();

    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,// this one remove extra field that is not in dto
      forbidNonWhitelisted: true,//rejects invalid datas
      transform: true, // transform payloads to DTO instances
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(3000);
}
bootstrap();