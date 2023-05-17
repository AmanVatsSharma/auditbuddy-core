'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_AUDIT_MUTATION } from '@/lib/graphql/mutations/createAudit';
import { ValidationService } from '@/lib/services/validation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function StartAudit() {
  const [url, setUrl] = useState('');
  const { toast } = useToast();
  
  const [createAudit, { loading, error }] = useMutation(CREATE_AUDIT_MUTATION, {
    onCompleted: (data) => {
      toast({
        title: 'Audit Started',
        description: `Now analyzing ${data.createAudit.url}`,
      });
      setUrl('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    const validation = ValidationService.validateUrl(url);
    if (!validation.isValid) {
      toast({
        title: 'Invalid URL',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAudit({
        variables: { url: validation.normalizedUrl },
      });
    } catch (err) {
      // GraphQL errors are handled by onError above
      console.error('Unexpected error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            'Start Audit'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </form>
  );
} 