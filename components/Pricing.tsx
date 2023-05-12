export function Pricing() {
  return (
    <div id="pricing" className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-center">
            Pricing Plans
          </h2>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start with our free audit and upgrade for detailed insights
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          {/* Free Tier */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Basic Audit
              </h3>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for getting started with website analysis
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/audit</span>
              </p>
              <a
                href="#audit-form"
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Start Free Audit
              </a>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                What's included
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Basic SEO analysis</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Performance overview</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Basic security check</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="border border-indigo-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Premium Report
              </h3>
              <p className="mt-4 text-sm text-gray-500">
                Comprehensive analysis with actionable insights
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$49</span>
                <span className="text-base font-medium text-gray-500">/audit</span>
              </p>
              <a
                href="#audit-form"
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Upgrade to Premium
              </a>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                Everything in Basic, plus:
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Detailed technical SEO audit</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Complete performance analysis</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Advanced security assessment</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Accessibility compliance report</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Prioritized recommendations</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">PDF export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 