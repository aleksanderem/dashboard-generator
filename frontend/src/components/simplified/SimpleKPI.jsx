import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

export default function SimpleKPI({
  title = 'KPI',
  value = '0',
  subtitle = '+0%',
  trend = 'neutral',
  color,
  skeleton = false
}) {
  const themeColor = useThemeColor();
  const valueColor = color || themeColor;
  // skeleton can be: false, 'title', 'semi', or 'full'
  // title: only title as skeleton
  // semi: title and subtitle as skeleton, value shown
  // full: everything as skeleton including value
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

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
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="widget-value" style={{ color: valueColor }}>
        {showDataSkeleton ? <Skeleton width="80%" height="32px" /> : value}
      </div>
      {subtitle && (
        <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
          {!showDataSkeleton && getTrendIcon()}
          <span className="widget-subtitle">
            {showTextSkeleton ? <Skeleton width="40%" height="14px" /> : subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
