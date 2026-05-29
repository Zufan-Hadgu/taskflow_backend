import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const uniqueEmail = () =>
    `auth-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  const validRegisterBody = (email = uniqueEmail()) => ({
    name: 'E2E Test User',
    email,
    password: 'password123',
    confirmPassword: 'password123',
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('creates a user and returns a JWT access token', async () => {
      const body = validRegisterBody();

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            name: body.name,
            email: body.email,
            role: 'user',
          },
          access_token: expect.any(String),
        },
      });
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('rejects invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterBody('not-an-email'))
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('rejects password shorter than 8 characters', async () => {
      const email = uniqueEmail();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Short Pass',
          email,
          password: 'short1',
          confirmPassword: 'short1',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      const body = validRegisterBody();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(body)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(body)
        .expect(500);
    });
  });

  describe('POST /auth/login', () => {
    const loginUser = {
      email: uniqueEmail(),
      password: 'password123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Login E2E User',
          ...loginUser,
          confirmPassword: loginUser.password,
        })
        .expect(201);
    });

    it('returns user and access_token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginUser.email,
          password: loginUser.password,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: loginUser.email,
          },
          access_token: expect.any(String),
        },
      });
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginUser.email,
          password: 'wrong-password',
        })
        .expect(401);

      expect(res.body.message).toContain('Invalid credentials');
    });

    it('returns 401 for unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nobody@example.com',
          password: loginUser.password,
        })
        .expect(401);
    });
  });

  describe('JWT-protected routes', () => {
    let accessToken: string;
    let registeredEmail: string;

    beforeAll(async () => {
      registeredEmail = uniqueEmail();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterBody(registeredEmail))
        .expect(201);

      accessToken = registerRes.body.data.access_token;
    });

    it('GET /users/profile returns the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          email: registeredEmail,
          name: 'E2E Test User',
        },
      });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('GET /users/profile returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('GET /users/profile returns 401 for an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer not-a-valid-jwt')
        .expect(401);
    });
  });
});
