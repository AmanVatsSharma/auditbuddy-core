import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function AccessibilityResults({ audit }: { audit: any }) {
  const getImpactIcon = (impact: 'minor' | 'moderate' | 'serious' | 'critical') => {
    switch (impact) {
      case 'minor':
        return <AlertTriangle className="h-5 w-5 text-yellow-300" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'serious':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Passed Tests
                </h4>
                <p className="text-xl font-semibold text-gray-700">
                  {audit.accessibilityReport.passes}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Violations
                </h4>
                <p className="text-xl font-semibold text-gray-700">
                  {audit.accessibilityReport.violations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Needs Review
                </h4>
                <p className="text-xl font-semibold text-gray-700">
                  {audit.accessibilityReport.incomplete}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Violations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Accessibility Issues
        </h3>
        <div className="space-y-4">
          {audit.accessibilityReport.violations.map((violation: any, index: number) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-start">
                  {getImpactIcon(violation.impact)}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {violation.help}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize" 
                        style={{
                          backgroundColor: violation.impact === 'critical' ? '#FEE2E2' : 
                                         violation.impact === 'serious' ? '#FFEDD5' : 
                                         violation.impact === 'moderate' ? '#FEF3C7' : '#FEF9C3',
                          color: violation.impact === 'critical' ? '#991B1B' : 
                                 violation.impact === 'serious' ? '#9A3412' : 
                                 violation.impact === 'moderate' ? '#92400E' : '#854D0E'
                        }}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {violation.description}
                    </p>
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">
                        Affected Elements ({violation.nodes.length}):
                      </h5>
                      <div className="space-y-2">
                        {violation.nodes.map((node: any, nodeIndex: number) => (
                          <div key={nodeIndex} className="text-xs bg-gray-50 p-2 rounded">
                            <code className="text-gray-600">{node.html}</code>
                          </div>
                        ))}
                      </div>
                    </div>
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