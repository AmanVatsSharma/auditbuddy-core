interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  error?: string;
}

export function ScoreCard({ title, score, description, error }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center">
          {error ? (
            <div className="text-red-500 text-sm">Failed</div>
          ) : (
            <div className="text-2xl font-bold text-indigo-600">{score}%</div>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 