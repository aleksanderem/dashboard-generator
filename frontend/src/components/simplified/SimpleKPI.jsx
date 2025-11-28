import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Skeleton = ({ width = '100%', height = '1em', className = '' }) => (
  <div
    className={`skeleton-loader ${className}`}
    style={{
      width,
      height,
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}
  />
);

export default function SimpleKPI({ title = 'KPI', value = '0', subtitle = '+0%', trend = 'neutral', color, showSkeleton = false }) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showSkeleton ? (
          <div className="flex flex-col gap-2">
            <Skeleton width="70%" height="1em" />
            <Skeleton width="50%" height="1em" />
          </div>
        ) : (
          title
        )}
      </div>
      <div className="widget-value" style={{ color: color || undefined }}>
        {value}
      </div>
      {subtitle && (
        <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
          {!showSkeleton && getTrendIcon()}
          <span className="widget-subtitle">
            {showSkeleton ? <Skeleton width="60%" height="1em" /> : subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
