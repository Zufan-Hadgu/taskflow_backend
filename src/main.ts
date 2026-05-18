import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import {ResponseInterceptor} from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Projects API')
    .setDescription('API for managing projects')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', 
    )
    .build();

    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,// this one remove extra field that is not in dto
      forbidNonWhitelisted: true,//rejects invalid datas
      transform: true, // transform payloads to DTO instances
    }),
  );
   app.enableCors({
    origin:"*",
    methods:"GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials:true,
   })

   app.use(helmet())

   app.useGlobalInterceptors(new ResponseInterceptor());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(3000);
}
bootstrap();