import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

export default function SimplePieChart({ title, percentage = 75, value, segments, height, skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const themeColor = useThemeColor();

  const defaultSegments = segments || [
    { name: 'Complete', value: percentage, color: themeColor },
    { name: 'Remaining', value: 100 - percentage, color: '#e5e7eb' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex-1 flex items-center justify-center relative mt-4" style={{ minHeight: height ? `${height}px` : '200px' }}>
        {showDataSkeleton ? (
          <Skeleton width="100%" height={height || 200} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defaultSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {defaultSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {!showTextSkeleton && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: themeColor }}>
                    {value || `${percentage}%`}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
