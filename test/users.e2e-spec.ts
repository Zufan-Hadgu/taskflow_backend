import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  authHeader,
  createE2eApp,
  registerUser,
} from './helpers/e2e-app';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/profile', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('returns the authenticated user without password', async () => {
      const { accessToken, email, user } = await registerUser(app, {
        name: 'Profile E2E User',
      });

      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: user.id,
          email,
          name: 'Profile E2E User',
          role: 'user',
        },
      });
      expect(res.body.data).not.toHaveProperty('password');
    });
  });

  describe('GET /users/all-users', () => {
    it('returns 403 for a non-admin user', async () => {
      const { accessToken } = await registerUser(app);

      await request(app.getHttpServer())
        .get('/users/all-users')
        .set(authHeader(accessToken))
        .expect(403);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/users/all-users').expect(401);
    });
  });
});
