'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

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

interface PremiumFormData {
  company: string;
  phone: string;
  requirements: string;
}

export function PremiumReportForm({ auditId }: { auditId: string }) {
  const { register, handleSubmit } = useForm<PremiumFormData>();
  const [upgradeToPremium] = useMutation(UPGRADE_TO_PREMIUM);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: PremiumFormData) => {
    setLoading(true);
    try {
      const result = await upgradeToPremium({
        variables: { auditId }
      });
      
      // Handle successful upgrade
      window.location.href = `/audit/${auditId}/premium`;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          {...register('company')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Specific Requirements
        </label>
        <textarea
          {...register('requirements')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Processing...' : 'Upgrade to Premium Report'}
      </button>
    </form>
  );
} 