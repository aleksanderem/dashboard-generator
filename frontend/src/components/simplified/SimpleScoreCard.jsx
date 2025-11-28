export default function SimpleScoreCard({ title, score, maxScore = '10', subtitle }) {
  const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100;
  const getColor = () => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex items-center justify-center flex-1">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={getColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold" style={{ color: getColor() }}>
              {score}
            </div>
            <div className="text-sm text-gray-500">/ {maxScore}</div>
          </div>
        </div>
      </div>
      {subtitle && <div className="widget-subtitle text-center">{subtitle}</div>}
    </div>
  );
}
