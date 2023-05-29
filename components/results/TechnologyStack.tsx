import { Technology } from '@/types/audit';
import { 
  SiReact, SiVuedotjs, SiWordpress, 
  SiGoogleanalytics, SiCloudflare 
} from 'react-icons/si';

const technologyIcons: Record<string, React.ComponentType> = {
  'React': SiReact,
  'Vue.js': SiVuedotjs,
  'WordPress': SiWordpress,
  'Google Analytics': SiGoogleanalytics,
  'Cloudflare': SiCloudflare,
};

export function TechnologyStack({ technologies }: { technologies: Technology[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Technology Stack
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.map((tech) => {
          const Icon = technologyIcons[tech.name] || null;
          return (
            <div 
              key={tech.name}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
            >
              {Icon && <Icon className="h-6 w-6 text-gray-600" />}
              <div>
                <p className="font-medium text-gray-900">{tech.name}</p>
                <p className="text-sm text-gray-500">
                  {tech.category}
                  {tech.version && ` (v${tech.version})`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 