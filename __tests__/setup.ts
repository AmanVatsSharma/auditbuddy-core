import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { mockServer } from './mocks/server';
import { prisma } from '@/lib/prisma';

beforeAll(async () => {
  mockServer.listen();
  // Clear database before tests
  await prisma.audit.deleteMany();
});

afterEach(async () => {
  mockServer.resetHandlers();
  // Clear database after each test
  await prisma.audit.deleteMany();
});

afterAll(async () => {
  mockServer.close();
  await prisma.$disconnect();
}); 