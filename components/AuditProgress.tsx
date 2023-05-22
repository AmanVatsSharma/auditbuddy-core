'use client';

import { useEffect } from 'react';
import { gql, useSubscription } from '@apollo/client';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const AUDIT_PROGRESS_SUBSCRIPTION = gql`
  subscription AuditProgress($id: ID!) {
    auditProgress(id: $id) {
      id
      status
      progress
      currentStep
      error
    }
  }
`;

export function AuditProgress({ auditId }: { auditId: string }) {
  const { toast } = useToast();

  const { data, loading, error } = useSubscription(
    AUDIT_PROGRESS_SUBSCRIPTION,
    {
      variables: { id: auditId },
    }
  );

  useEffect(() => {
    if (error) {
      toast({
        title: 'Subscription Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (loading) return null;

  const progress = data?.auditProgress;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {progress?.currentStep || 'Initializing...'}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(progress?.progress || 0)}%
        </span>
      </div>
      <Progress value={progress?.progress || 0} />
      {progress?.error && (
        <p className="text-sm text-red-500">{progress.error}</p>
      )}
    </div>
  );
} 