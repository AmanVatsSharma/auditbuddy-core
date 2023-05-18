'use client';

import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function AuditList() {
  const { data: audits, isLoading } = trpc.audit.listMine.useQuery();

  if (isLoading) {
    return <div>Loading your audits...</div>;
  }

  if (!audits?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No audits yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by running your first website audit.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start New Audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Website
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Scores
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {audits.map((audit) => (
                    <tr key={audit.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {audit.website.url}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          audit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          audit.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          audit.status === 'RUNNING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {audit.status === 'COMPLETED' && (
                          <div className="flex space-x-2">
                            <span className="text-green-600">SEO: {audit.seoScore}</span>
                            <span className="text-blue-600">Performance: {audit.performanceScore}</span>
                          </div>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/audit/${audit.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 