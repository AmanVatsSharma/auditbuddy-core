import { createTRPCRouter } from './trpc';
import { auditRouter } from './routers/audit';
import { userRouter } from './routers/user';

export const appRouter = createTRPCRouter({
  audit: auditRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter; 