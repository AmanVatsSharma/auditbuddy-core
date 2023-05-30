export default function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-2/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-8"></div>
        
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
} 