'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { SEOResults } from './results/SEOResults';
import { PerformanceResults } from './results/PerformanceResults';
import { AccessibilityResults } from './results/AccessibilityResults';
import { SecurityResults } from './results/SecurityResults';

const tabs = [
  { name: 'SEO', component: SEOResults },
  { name: 'Performance', component: PerformanceResults },
  { name: 'Accessibility', component: AccessibilityResults },
  { name: 'Security', component: SecurityResults },
];

export function DetailedResults({ audit }: { audit: any }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <Tab.Group>
        <Tab.List className="border-b border-gray-200">
          <div className="flex -mb-px">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  cn(
                    'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm',
                    selected
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </div>
        </Tab.List>
        <Tab.Panels className="p-6">
          {tabs.map((tab) => (
            <Tab.Panel key={tab.name}>
              <tab.component audit={audit} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 