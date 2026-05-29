import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';

export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();
  return app;
}

export const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

export async function registerUser(
  app: INestApplication<App>,
  options?: { name?: string; email?: string; password?: string },
) {
  const email = options?.email ?? uniqueEmail('e2e');
  const password = options?.password ?? 'password123';

  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      name: options?.name ?? 'E2E User',
      email,
      password,
      confirmPassword: password,
    })
    .expect(201);

  return {
    email,
    password,
    accessToken: res.body.data.access_token as string,
    user: res.body.data.user as { id: string; email: string; role: string },
  };
}

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
