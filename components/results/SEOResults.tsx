import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function SEOResults({ audit }: { audit: any }) {
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
    <div className="space-y-6">
      {/* Title Analysis */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Title Tag</h3>
        <div className="mt-2 flex items-start">
          {getStatusIcon(audit.seoReport.title.status)}
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              {audit.seoReport.title.message}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Current title ({audit.seoReport.title.length} characters):
              <br />
              {audit.seoReport.title.value}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Meta Description</h3>
        <div className="mt-2 flex items-start">
          {getStatusIcon(audit.seoReport.description.status)}
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              {audit.seoReport.description.message}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Current description ({audit.seoReport.description.length} characters):
              <br />
              {audit.seoReport.description.value}
            </p>
          </div>
        </div>
      </div>

      {/* Additional SEO checks... */}
    </div>
  );
} 