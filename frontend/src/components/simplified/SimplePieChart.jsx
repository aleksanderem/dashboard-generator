import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useEffect, useState } from 'react';

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 14}
        fill="#6b7280"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </text>
    </g>
  );
};

export default function SimplePieChart({ title, percentage = 75, value, segments, height }) {
  const [themeColor, setThemeColor] = useState('#14b8a6');

  useEffect(() => {
    // Get theme color from CSS custom property
    const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
    if (color) {
      setThemeColor(color);
    }
  }, []);

  const defaultSegments = segments || [
    { name: 'Complete', value: percentage, color: themeColor },
    { name: 'Remaining', value: 100 - percentage, color: '#e5e7eb' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex-1 flex items-center justify-center relative mt-4" style={{ minHeight: height ? `${height}px` : '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={defaultSegments}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            >
              {defaultSegments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {value || `${percentage}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
