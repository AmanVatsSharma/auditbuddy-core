import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function PerformanceResults({ audit }: { audit: any }) {
  const getMetricStatus = (score: number) => {
    if (score >= 0.9) return 'good';
    if (score >= 0.5) return 'warning';
    return 'bad';
  };

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'FCP':
      case 'LCP':
      case 'TTI':
      case 'TBT':
        return `${(value / 1000).toFixed(2)}s`;
      case 'CLS':
        return value.toFixed(3);
      default:
        return value.toFixed(2);
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'bad':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(audit.performanceReport.metrics).map(([key, data]: [string, any]) => (
            <div key={key} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  {getStatusIcon(getMetricStatus(data.score))}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {key}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatMetricValue(key, data.value)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Optimization Opportunities
        </h3>
        <div className="space-y-4">
          {audit.performanceReport.opportunities.map((opportunity: any, index: number) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-start">
                  {getStatusIcon(getMetricStatus(opportunity.score))}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {opportunity.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {opportunity.description}
                    </p>
                    {opportunity.savings > 0 && (
                      <p className="mt-2 text-sm text-indigo-600">
                        Potential savings: {(opportunity.savings / 1000).toFixed(2)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 