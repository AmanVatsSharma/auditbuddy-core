import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GDPRResultsProps {
  audit: {
    gdprReport: {
      score: number;
      report: {
        cookieConsent: {
          exists: boolean;
          compliant: boolean;
          issues: string[];
        };
        privacyPolicy: {
          exists: boolean;
          lastUpdated?: Date;
          issues: string[];
        };
        dataCollection: {
          forms: Array<{
            purpose: string;
            fields: string[];
            hasConsent: boolean;
            issues: string[];
          }>;
          trackers: Array<{
            name: string;
            purpose: string;
            compliant: boolean;
          }>;
        };
        dataProtection: {
          encryption: boolean;
          secureTransfer: boolean;
          issues: string[];
        };
        recommendations: Array<{
          priority: 'critical' | 'high' | 'medium' | 'low';
          description: string;
          action: string;
        }>;
      };
    };
  };
}

export function GDPRResults({ audit }: GDPRResultsProps) {
  const { report, score } = audit.gdprReport;

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">GDPR Compliance</h3>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-indigo-500 mr-2" />
            <span className="text-2xl font-bold text-indigo-600">{score}%</span>
          </div>
        </div>
      </div>

      {/* Cookie Consent */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Cookie Consent
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Banner Present</span>
              {getStatusIcon(report.cookieConsent.exists)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">GDPR Compliant</span>
              {getStatusIcon(report.cookieConsent.compliant)}
            </div>
            {report.cookieConsent.issues.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Issues</h5>
                <ul className="space-y-2">
                  {report.cookieConsent.issues.map((issue, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-red-600"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Privacy Policy
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Policy Present</span>
              {getStatusIcon(report.privacyPolicy.exists)}
            </div>
            {report.privacyPolicy.lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated:{' '}
                {formatDistanceToNow(new Date(report.privacyPolicy.lastUpdated), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>
        </div>

        {/* Data Collection */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Data Collection
          </h4>
          {report.dataCollection.forms.length > 0 && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-900">Forms</h5>
              {report.dataCollection.forms.map((form, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{form.purpose}</span>
                    {getStatusIcon(form.hasConsent)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Fields: {form.fields.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Recommendations
          </h4>
          <div className="space-y-4">
            {report.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rec.description}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      rec.priority
                    )}`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 