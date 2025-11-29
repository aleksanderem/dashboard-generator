import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

export default function SimpleProgressBar({ title = 'Progress', percentage = 75, current, total, label, color, skeleton = false }) {
  const themeColor = useThemeColor();
  const barColor = color || themeColor;

  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const progress = Math.min(Math.max(percentage || 0, 0), 100);

  // Calculate current/total display
  const displayLabel = label || (current !== undefined && total !== undefined ? `${current} / ${total}` : null);

  return (
    <div className="simplified-widget">
      {/* Title */}
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>

      {/* Progress section */}
      <div className="relative flex flex-col mt-auto" style={{ background: 'transparent' }}>
        {/* Label (current/total) - positioned above the bar */}
        {displayLabel && (
          <div
            className="widget-subtitle"
            style={{
              position: 'absolute',
              top: '-80px',
              left: 0,
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              background: '#efefef',
              borderRadius: '5px',
              padding: '2px 10px',
            }}
          >
            {showTextSkeleton ? <Skeleton width="50px" height="14px" /> : displayLabel}
          </div>
        )}

        {/* Progress bar - positioned above the percentage */}
        <div
          className="rounded-full transition-all duration-500"
          style={{
            position: 'absolute',
            top: '-32px',
            left: 0,
            width: showDataSkeleton ? '0%' : `${progress}%`,
            height: '16px',
            backgroundColor: barColor,
            zIndex: 2,
          }}
        />

        {/* Large percentage */}
        <span
          className="font-semibold"
          style={{
            fontSize: '3rem',
            lineHeight: '3rem',
            color: showDataSkeleton ? '#e5e7eb' : barColor
          }}
        >
          {showTextSkeleton ? <Skeleton width="80px" height="48px" /> : `${progress}%`}
        </span>
      </div>
    </div>
  );
}
