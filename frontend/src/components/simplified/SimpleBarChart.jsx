import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function SimpleBarChart({ title, data, color = '#14b8a6', height, maxBars, showTooltip = true }) {
  // Default data if none provided
  const defaultData = [
    { name: 'Day 1', value: 120 },
    { name: 'Day 2', value: 86 },
    { name: 'Day 3', value: 145 },
    { name: 'Day 4', value: 98 },
    { name: 'Day 5', value: 167 },
    { name: 'Day 6', value: 134 },
    { name: 'Day 7', value: 112 }
  ];

  // Use provided data or fallback to default
  let chartData = (!data || data.length === 0) ? defaultData : data;

  // Limit data to maxBars if specified
  if (maxBars && maxBars > 0) {
    chartData = chartData.slice(0, maxBars);
  }

  // Always show tooltip for middle bar
  const middleIndex = Math.floor((chartData?.length || 0) / 2);

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex-1 mt-4" style={{ minHeight: height ? `${height}px` : '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
            />
            {showTooltip && (
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(20, 184, 166, 0.1)' }}
                active={true}
                defaultIndex={middleIndex}
                isAnimationActive={false}
              />
            )}
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
