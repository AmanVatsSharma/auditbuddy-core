import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuditProgress } from '@/components/AuditProgress';
import { AUDIT_PROGRESS_SUBSCRIPTION } from '@/components/AuditProgress';

const mocks = [
  {
    request: {
      query: AUDIT_PROGRESS_SUBSCRIPTION,
      variables: { id: 'test-audit-id' },
    },
    result: {
      data: {
        auditProgress: {
          id: 'test-audit-id',
          status: 'RUNNING',
          progress: 45,
          currentStep: 'Analyzing SEO',
          error: null,
        },
      },
    },
  },
];

describe('AuditProgress', () => {
  it('renders progress correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuditProgress auditId="test-audit-id" />
      </MockedProvider>
    );

    expect(screen.getByText('Initializing...')).toBeInTheDocument();
  });
}); 