import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

export default function SimpleGaugeChart({ title, value, min = 0, max = 100, unit = '', height, color, skeleton = false }) {
  const themeColor = useThemeColor();
  const gaugeColor = color || themeColor;

  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  // Scale gauge based on available height - at 260px card height, gauge should be 190px
  // This gives us a ratio of approximately 0.73
  const gaugeHeight = height ? height * 0.73 : 140; // Default 140px for better visibility
  const gaugeWidth = gaugeHeight * 2;

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex items-center justify-center" style={{ height: height ? `${height}px` : '200px' }}>
        {showDataSkeleton ? (
          <Skeleton width="100%" height={height || 200} />
        ) : (
          <div className="relative" style={{ width: `${gaugeWidth}px`, height: `${gaugeHeight}px` }}>
            {/* Gauge Background */}
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
              />
              {/* Needle */}
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="30"
                stroke="#374151"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${rotation} 100 90)`}
              />
              <circle cx="100" cy="90" r="6" fill="#374151" />
            </svg>
            {/* Value display removed - only show gauge visual */}
          </div>
        )}
      </div>
    </div>
  );
}
