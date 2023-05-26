import { FileCode, Package, AlertTriangle } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface BundleResultsProps {
  audit: {
    bundleReport: {
      score: number;
      report: {
        totalSize: number;
        bundles: Array<{
          name: string;
          size: number;
          type: 'js' | 'css';
          gzipSize: number;
          treeshakeable: boolean;
          coverage: number;
        }>;
        issues: Array<{
          severity: 'high' | 'medium' | 'low';
          description: string;
          suggestion: string;
        }>;
        recommendations: Array<{
          type: string;
          impact: 'high' | 'medium' | 'low';
          description: string;
          potentialSavings: number;
        }>;
      };
    };
  };
}

export function BundleResults({ audit }: BundleResultsProps) {
  const { report, score } = audit.bundleReport;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Bundle Analysis</h3>
          <div className="flex items-center">
            <Package className="h-5 w-5 text-indigo-500 mr-2" />
            <span className="text-2xl font-bold text-indigo-600">{score}%</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Total Size: {formatBytes(report.totalSize)}
        </p>
      </div>

      {/* Bundles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Bundle Details
          </h4>
          <div className="space-y-4">
            {report.bundles.map((bundle, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileCode className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{bundle.name}</span>
                  </div>
                  <span className={`text-sm ${
                    bundle.type === 'js' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {bundle.type.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>Size: {formatBytes(bundle.size)}</div>
                  <div>Gzipped: {formatBytes(bundle.gzipSize)}</div>
                  <div>Coverage: {bundle.coverage}%</div>
                  <div>
                    Treeshakeable: {bundle.treeshakeable ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues and Recommendations */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {/* Issues */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Issues Found
          </h4>
          <div className="space-y-4">
            {report.issues.map((issue, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">{issue.description}</p>
                    <p className="mt-1 text-sm">{issue.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Optimization Opportunities
          </h4>
          <div className="space-y-4">
            {report.recommendations.map((rec, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rec.description}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getSeverityColor(rec.impact)
                  }`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Potential savings: {formatBytes(rec.potentialSavings)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 