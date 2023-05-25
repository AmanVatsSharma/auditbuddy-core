import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

export function SecurityResults({ audit }: { audit: any }) {
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
      {/* SSL Status */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-start">
            {getStatusIcon(audit.securityReport.ssl.status)}
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                SSL Configuration
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {audit.securityReport.ssl.message}
              </p>
              {audit.securityReport.ssl.issuer && (
                <p className="mt-1 text-xs text-gray-500">
                  Issued by: {audit.securityReport.ssl.issuer}
                </p>
              )}
              {audit.securityReport.ssl.expiresAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Expires: {new Date(audit.securityReport.ssl.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Headers */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Security Headers
        </h3>
        <div className="space-y-4">
          {Object.entries(audit.securityReport.headers).map(([header, data]: [string, any]) => (
            <div key={header} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-start">
                  {getStatusIcon(data.status)}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {header}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {data.message}
                    </p>
                    {data.value && (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        <code>{data.value}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities */}
      {audit.securityReport.vulnerabilities.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Security Vulnerabilities
          </h3>
          <div className="space-y-4">
            {audit.securityReport.vulnerabilities.map((vuln: any, index: number) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-start">
                    <Shield className={`h-5 w-5 ${
                      vuln.severity === 'critical' ? 'text-red-500' :
                      vuln.severity === 'high' ? 'text-orange-500' :
                      vuln.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="ml-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {vuln.type}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: 
                              vuln.severity === 'critical' ? '#FEE2E2' :
                              vuln.severity === 'high' ? '#FFEDD5' :
                              vuln.severity === 'medium' ? '#FEF3C7' :
                              '#DBEAFE',
                            color:
                              vuln.severity === 'critical' ? '#991B1B' :
                              vuln.severity === 'high' ? '#9A3412' :
                              vuln.severity === 'medium' ? '#92400E' :
                              '#1E40AF'
                          }}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {vuln.description}
                      </p>
                      <p className="mt-2 text-sm text-indigo-600">
                        Recommendation: {vuln.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 