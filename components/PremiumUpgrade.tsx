'use client';

import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { PremiumReportForm } from './PremiumReportForm';

const UPGRADE_TO_PREMIUM = gql`
  mutation UpgradeToPremium($auditId: ID!) {
    upgradeToPremium(auditId: $auditId) {
      id
      premiumResults {
        pdfReport
      }
    }
  }
`;

export function PremiumUpgrade({ auditId }: { auditId: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Upgrade to Premium Report
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Get detailed insights, actionable recommendations, and a comprehensive
            PDF report. Perfect for professionals and businesses.
          </p>
        </div>
        <div className="mt-5">
          {showForm ? (
            <PremiumReportForm auditId={auditId} />
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 