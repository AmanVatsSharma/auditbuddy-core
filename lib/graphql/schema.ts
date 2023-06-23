import { createSchema } from 'graphql-yoga';
import { createPubSub } from '@graphql-yoga/subscription';
import { redis } from '@/lib/config/redis';
import { AuditStatus } from '@prisma/client';

const pubSub = createPubSub();

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Audit {
      id: ID!
      url: String!
      status: AuditStatus!
      progress: Float!
      currentStep: String
      results: AuditResults
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type AuditResults {
      seoScore: Float
      performanceScore: Float
      accessibilityScore: Float
      securityScore: Float
      carbonScore: Float
      detailedResults: JSON
    }

    enum AuditStatus {
      PENDING
      RUNNING
      COMPLETED
      FAILED
    }

    type Query {
      audit(id: ID!): Audit
      audits(first: Int, after: String): AuditConnection!
    }

    type Mutation {
      createAudit(url: String!): Audit!
      cancelAudit(id: ID!): Boolean!
    }

    type Subscription {
      auditProgress(id: ID!): AuditProgressUpdate!
    }

    type AuditProgressUpdate {
      id: ID!
      status: AuditStatus!
      progress: Float!
      currentStep: String
      error: String
    }

    type AuditConnection {
      edges: [AuditEdge!]!
      pageInfo: PageInfo!
    }

    type AuditEdge {
      node: Audit!
      cursor: String!
    }

    type PageInfo {
      hasNextPage: Boolean!
      endCursor: String
    }
  `,
  resolvers: {
    Query: {
      audit: async (_, { id }, { prisma }) => {
        return prisma.audit.findUnique({ where: { id } });
      },
      audits: async (_, { first, after }, { prisma }) => {
        const audits = await prisma.audit.findMany({
          take: first || 10,
          cursor: after ? { id: after } : undefined,
          orderBy: { createdAt: 'desc' },
        });

        return {
          edges: audits.map(audit => ({
            node: audit,
            cursor: audit.id,
          })),
          pageInfo: {
            hasNextPage: audits.length === first,
            endCursor: audits[audits.length - 1]?.id,
          },
        };
      },
    },
    Mutation: {
      createAudit: async (_, { url }, { prisma, user }) => {
        const audit = await prisma.audit.create({
          data: {
            url,
            status: 'PENDING',
            userId: user?.id,
          },
        });

        // Cache initial state
        await redis.set(`audit:${audit.id}`, JSON.stringify({
          status: 'PENDING',
          progress: 0,
          currentStep: 'Initializing',
        }));

        // Start audit process
        startAuditProcess(audit.id);

        return audit;
      },
      cancelAudit: async (_, { id }, { prisma, user }) => {
        const audit = await prisma.audit.findUnique({ where: { id } });
        if (!audit || audit.userId !== user?.id) {
          throw new Error('Audit not found or unauthorized');
        }

        await prisma.audit.update({
          where: { id },
          data: { status: 'FAILED', error: 'Cancelled by user' },
        });

        return true;
      },
    },
    Subscription: {
      auditProgress: {
        subscribe: (_, { id }) => {
          const asyncIterator = pubSub.subscribe(`audit:${id}`);
          return {
            [Symbol.asyncIterator]() {
              return asyncIterator;
            }
          };
        },
        resolve: (payload) => payload,
      },
    },
  },
});

// Helper function to publish progress updates
export async function publishAuditProgress(
  id: string, 
  data: { status: AuditStatus; progress: number; currentStep?: string; error?: string }
) {
  await redis.set(`audit:${id}`, JSON.stringify(data));
  pubSub.publish(`audit:${id}`, {
    id,
    ...data,
  });
} 