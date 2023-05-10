'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Welcome back, {session?.user?.name || 'User'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your website audits
        </p>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Audit
        </Link>
      </div>
    </div>
  );
} 