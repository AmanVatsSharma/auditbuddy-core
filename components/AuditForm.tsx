"use client"

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

export function AuditForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const createAudit = trpc.audit.create.useMutation({
    onSuccess: (data) => {
      router.push(`/audit/${data.id}`);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await createAudit.mutateAsync({ url });
    } catch (error) {
      // Error will be handled by onError above
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={createAudit.isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {createAudit.isLoading ? 'Analyzing...' : 'Start Audit'}
      </button>
    </form>
  );
} 