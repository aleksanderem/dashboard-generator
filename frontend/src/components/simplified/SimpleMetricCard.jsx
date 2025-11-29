import Skeleton from '../Skeleton';

export default function SimpleMetricCard({ title = 'Metric', value = '0', unit, subtitle = 'No data available', skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex items-baseline gap-2 mt-auto">
        <div className="widget-value">
          {showTextSkeleton ? <Skeleton width="80px" height="32px" /> : value}
        </div>
        {unit && !showTextSkeleton && <span className="text-lg text-gray-500 font-medium">{unit}</span>}
      </div>
      {subtitle && (
        <div className="widget-subtitle mt-2">
          {showTextSkeleton ? <Skeleton width="70%" height="14px" /> : subtitle}
        </div>
      )}
    </div>
  );
}
