import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../Skeleton';
import useThemeColor from '../../hooks/useThemeColor';

const CustomTooltip = ({ active, payload }) => {
  if (!payload || !payload.length) return null;

  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
      <div className="text-xs font-semibold text-gray-700 mb-1">
        {payload[0].payload.name}
      </div>
      <div className="text-sm font-bold text-gray-900">
        {payload[0].value.toLocaleString()}
      </div>
    </div>
  );
};

export default function SimpleAreaChart({ title, data, color, height, showTooltip = true, skeleton = false }) {
  const themeColor = useThemeColor();
  const chartColor = color || themeColor;

  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  // Default data if none provided
  const defaultData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 145 },
    { name: 'Mar', value: 132 },
    { name: 'Apr', value: 167 },
    { name: 'May', value: 154 },
    { name: 'Jun', value: 189 },
    { name: 'Jul', value: 176 }
  ];

  // Use provided data or fallback to default
  const chartData = (!data || data.length === 0) ? defaultData : data;

  // Always show tooltip for middle point
  const middleIndex = Math.floor((chartData?.length || 0) / 2);

  // Always show axis labels (even in skeleton mode)
  const axisTickStyle = { fontSize: 12, fill: '#6b7280' };

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex-1 mt-4" style={{ minHeight: height ? `${height}px` : '200px' }}>
        {showDataSkeleton ? (
          <Skeleton width="100%" height={height || 200} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={axisTickStyle}
                stroke="#e5e7eb"
              />
              <YAxis
                tick={axisTickStyle}
                stroke="#e5e7eb"
              />
              {showTooltip && !showTextSkeleton && (
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: chartColor, strokeWidth: 2, strokeDasharray: '5 5' }}
                  active={true}
                  defaultIndex={middleIndex}
                  isAnimationActive={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorValue)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
