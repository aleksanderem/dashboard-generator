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

export default function SimpleMetricCard({ title = 'Metric', value = '0', unit, subtitle = 'No data available', showSkeleton = false }) {
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
      <div className="flex items-baseline gap-2 mt-auto">
        <div className="widget-value">{value}</div>
        {unit && <span className="text-lg text-gray-500 font-medium">{unit}</span>}
      </div>
      {subtitle && (
        <div className="widget-subtitle">
          {showSkeleton ? <Skeleton width="80%" height="1em" /> : subtitle}
        </div>
      )}
    </div>
  );
}
