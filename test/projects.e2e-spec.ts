import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  authHeader,
  createE2eApp,
  registerUser,
} from './helpers/e2e-app';

describe('Projects (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let otherUserToken: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const owner = await registerUser(app, { name: 'Project Owner' });
    accessToken = owner.accessToken;

    const other = await registerUser(app, { name: 'Other User' });
    otherUserToken = other.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    it('returns 401 for unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/projects').expect(401);
    });
  });

  describe('POST /projects', () => {
    it('creates a project for the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'E2E Project Alpha' })
        .expect(201);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'E2E Project Alpha',
        },
      });
    });
  });

  describe('GET /projects', () => {
    let searchableProjectId: string;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'UniqueSearchableProject' })
        .expect(201);

      searchableProjectId = createRes.body.data.id;
    });

    it('lists projects belonging to the current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(
        res.body.data.some((p: { id: string }) => p.id === searchableProjectId),
      ).toBe(true);
    });

    it('filters projects by name when search query is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .query({ search: 'UniqueSearchable' })
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'UniqueSearchableProject' }),
        ]),
      );
    });
  });

  describe('GET /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'Find One Project' })
        .expect(201);

      projectId = createRes.body.data.id;
    });

    it('returns a project when id is passed as query param', async () => {
      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .query({ id: projectId })
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: projectId,
          name: 'Find One Project',
        },
      });
    });

    it('does not return another user project', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .query({ id: projectId })
        .set(authHeader(otherUserToken))
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeNull();
        });
    });
  });

  describe('PATCH /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'Patch Me Project' })
        .expect(201);

      projectId = createRes.body.data.id;
    });

    it('updates a project owned by the user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set(authHeader(accessToken))
        .send({ name: 'Patched Project Name' })
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: projectId,
          name: 'Patched Project Name',
        },
      });
    });

    it('returns 500 when updating a project owned by another user', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set(authHeader(otherUserToken))
        .send({ name: 'Stolen Name' })
        .expect(500);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('deletes a project owned by the user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'Delete Me Project' })
        .expect(201);

      const projectId = createRes.body.data.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(deleteRes.body.data.message).toContain(projectId);

      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .query({ id: projectId })
        .set(authHeader(accessToken))
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeNull();
        });
    });

    it('returns 500 when deleting another user project', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set(authHeader(accessToken))
        .send({ name: 'Protected Delete Project' })
        .expect(201);

      const projectId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set(authHeader(otherUserToken))
        .expect(500);
    });
  });

  describe('POST /projects/with-task', () => {
    it('creates a project and its first task in one request', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects/with-task')
        .set(authHeader(accessToken))
        .send({
          project: { name: 'Project With Task' },
          task: { title: 'First task' },
        })
        .expect(201);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'Project With Task',
        },
      });
    });
  });
});
