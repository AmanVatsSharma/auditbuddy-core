import { createSchema } from 'graphql-yoga';
import { prisma } from '../db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      email: String!
      name: String
      isPremium: Boolean!
    }

    type AuditReport {
      id: ID!
      url: String!
      createdAt: String!
      basicResults: BasicAuditResults!
      premiumResults: PremiumAuditResults @auth(requires: PREMIUM)
    }

    type BasicAuditResults {
      seoScore: Float!
      performanceScore: Float!
      accessibilityScore: Float!
      securityScore: Float!
      summary: String!
    }

    type PremiumAuditResults {
      detailedSEO: JSON!
      detailedPerformance: JSON!
      detailedAccessibility: JSON!
      detailedSecurity: JSON!
      recommendations: [Recommendation!]!
      pdfReport: String!
    }

    type Recommendation {
      category: String!
      priority: String!
      description: String!
      impact: String!
    }

    input AuditInput {
      url: String!
      email: String!
    }

    type Mutation {
      requestAudit(input: AuditInput!): AuditReport!
      upgradeToPremium(auditId: ID!): AuditReport! @auth
    }

    type Query {
      me: User @auth
      auditReport(id: ID!): AuditReport
      myAudits: [AuditReport!]! @auth
    }

    directive @auth(requires: Role = USER) on OBJECT | FIELD_DEFINITION

    enum Role {
      USER
      PREMIUM
    }
  `,
  resolvers: {
    Query: {
      me: async (_, __, context) => {
        const session = await getServerSession(authOptions);
        if (!session?.user) return null;
        return prisma.user.findUnique({
          where: { email: session.user.email! }
        });
      },
      auditReport: async (_, { id }) => {
        return prisma.audit.findUnique({
          where: { id }
        });
      },
      myAudits: async (_, __, context) => {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error('Not authenticated');
        return prisma.audit.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' }
        });
      }
    },
    Mutation: {
      requestAudit: async (_, { input }, context) => {
        const session = await getServerSession(authOptions);
        const audit = await prisma.audit.create({
          data: {
            url: input.url,
            status: 'PENDING',
            user: session?.user ? {
              connect: { email: session.user.email! }
            } : undefined
          }
        });

        // Start audit process
        startAudit(audit.id).catch(console.error);

        // Send email notification
        await sendAuditNotification(input.email, audit.id);

        return audit;
      },
      upgradeToPremium: async (_, { auditId }, context) => {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error('Not authenticated');

        // Here you would typically integrate with a payment provider
        // For now, we'll just mark the user as premium
        await prisma.user.update({
          where: { email: session.user.email! },
          data: { isPremium: true }
        });

        return prisma.audit.findUnique({
          where: { id: auditId }
        });
      }
    }
  }
}); 