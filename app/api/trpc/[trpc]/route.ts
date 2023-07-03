import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { handleApiError } from '@/lib/utils/api-error-handler';

const handler = async (req: Request) => {
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createTRPCContext({ req }),
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export { handler as GET, handler as POST }; 