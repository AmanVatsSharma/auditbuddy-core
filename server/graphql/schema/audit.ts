import { gql } from 'graphql-tag';

export const auditTypeDefs = gql`
  type Technology {
    name: String!
    category: String!
    confidence: Float!
    version: String
  }

  type AuditMetrics {
    seoScore: Int!
    performanceScore: Int!
    accessibilityScore: Int!
    securityScore: Int!
  }

  type AuditReport {
    id: ID!
    url: String!
    status: String!
    metrics: AuditMetrics!
    technologies: [Technology!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    audit(id: ID!): AuditReport
    audits(userId: ID!): [AuditReport!]!
  }

  type Mutation {
    createAudit(url: String!): AuditReport!
    rerunAudit(id: ID!): AuditReport!
  }

  type Subscription {
    auditProgress(id: ID!): AuditProgress!
  }

  type AuditProgress {
    id: ID!
    status: String!
    progress: Float!
    currentStep: String
  }
`; 