'use client';

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ScoreCard } from './ScoreCard';
import { DetailedResults } from './DetailedResults';
import { LoadingSpinner } from './ui/loading-spinner';

export function AuditResults({ auditId }: { auditId: string }) {
  const { data: audit, isLoading } = trpc.audit.getStatus.useQuery(auditId, {
    refetchInterval: (data) => 
      data?.status === 'COMPLETED' || data?.status === 'FAILED' ? false : 5000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!audit) {
    return <div>Audit not found</div>;
  }

  if (audit.status === 'PENDING' || audit.status === 'RUNNING') {
    return (
      <div className="text-center py-12">
        <LoadingSpinner />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Analyzing {audit.website.url}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          This may take a few minutes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {audit.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Some tests failed
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {audit.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="SEO"
          score={audit.seoScore ?? 0}
          description="Search Engine Optimization"
          error={audit.seoError}
        />
        <ScoreCard
          title="Performance"
          score={audit.performanceScore ?? 0}
          description="Website Speed & Performance"
          error={audit.performanceError}
        />
        <ScoreCard
          title="Accessibility"
          score={audit.accessibilityScore ?? 0}
          description="WCAG Compliance"
          error={audit.accessibilityError}
        />
        <ScoreCard
          title="Security"
          score={audit.securityScore ?? 0}
          description="Security Headers & Best Practices"
          error={audit.securityError}
        />
      </div>

      <DetailedResults audit={audit} />
    </div>
  );
} 