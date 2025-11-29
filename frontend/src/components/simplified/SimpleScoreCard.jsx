import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

export default function SimpleScoreCard({ title, score, maxScore = '10', subtitle, color, skeleton = false }) {
  const themeColor = useThemeColor();
  const scoreColor = color || themeColor;

  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100;

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex items-center justify-center flex-1">
        {showDataSkeleton ? (
          <Skeleton width="128px" height="128px" borderRadius="50%" />
        ) : (
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
                stroke={scoreColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                {showTextSkeleton ? '7.5' : score}
              </div>
              <div className="text-sm text-gray-500">/ {showTextSkeleton ? '10' : maxScore}</div>
            </div>
          </div>
        )}
      </div>
      {subtitle && (
        <div className="widget-subtitle text-center">
          {showTextSkeleton ? <Skeleton width="70%" height="14px" /> : subtitle}
        </div>
      )}
    </div>
  );
}
