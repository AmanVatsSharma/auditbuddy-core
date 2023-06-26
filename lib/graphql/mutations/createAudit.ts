import { gql } from '@apollo/client';

export const CREATE_AUDIT_MUTATION = gql`
  mutation CreateAudit($url: String!) {
    createAudit(url: $url) {
      id
      url
      status
      createdAt
      error
    }
  }
`;

export interface CreateAuditResponse {
  createAudit: {
    id: string;
    url: string;
    status: string;
    createdAt: string;
    error?: string;
  };
} 