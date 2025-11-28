import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function SimpleLineChart({ title, data, color = '#14b8a6', height, showTooltip = true }) {
  // Default data if none provided
  const defaultData = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 132 },
    { name: 'Wed', value: 101 },
    { name: 'Thu', value: 134 },
    { name: 'Fri', value: 90 },
    { name: 'Sat', value: 130 },
    { name: 'Sun', value: 110 }
  ];

  // Use provided data or fallback to default
  const chartData = (!data || data.length === 0) ? defaultData : data;

  // Always show tooltip for middle point
  const middleIndex = Math.floor((chartData?.length || 0) / 2);

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex-1 mt-4" style={{ minHeight: height ? `${height}px` : '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
                cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
                active={true}
                defaultIndex={middleIndex}
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
