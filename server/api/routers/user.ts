import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
      return user;
    }),

  upgradeToPremium: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { isPremium: true },
    });
    return user;
  }),
}); 