import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

let token = '';
let projectId = 1;
let taskId = 0;

async function login(email: string, password: string) {
  const res = await request(app).post('/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe('Optimistic locking flow', () => {
  beforeAll(async () => {
    token = await login('admin@demo.test', 'Passw0rd!');
  });

  it('create task then simulate stale version', async () => {
    // Create a project (admin)
    const projRes = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Locking Project', description: 'test' });
    expect(projRes.status).toBe(201);
    projectId = projRes.body.id;

    // Create task
    const createRes = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Optimistic' });
    expect(createRes.status).toBe(201);
    taskId = createRes.body.id;

    // First fetch to get current version
    const listRes = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`);
    const task = listRes.body.find((t: any) => t.id === taskId);
    const v = task.version;

    // Simulate stale update: use v-1
    const staleRes = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', String(v - 1))
      .send({ title: 'new title' });
    expect(staleRes.status).toBe(409);

    // Happy path with correct version
    const okRes = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', String(v))
      .send({ title: 'new title' });
    expect(okRes.status).toBe(200);
    expect(okRes.body.title).toBe('new title');
  });
});
