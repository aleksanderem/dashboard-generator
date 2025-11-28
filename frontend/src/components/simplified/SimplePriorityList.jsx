// Priority list with colored badges
export default function SimplePriorityList({ title, priorities = [] }) {
  const defaultPriorities = priorities.length > 0 ? priorities : [
    { label: 'Low', count: 124, color: '#10b981' },
    { label: 'Medium', count: 178, color: '#f59e0b' },
    { label: 'High', count: 39, color: '#f97316' },
    { label: 'Critical', count: 6, color: '#dc2626' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {defaultPriorities.map((priority, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: priority.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {priority.label}:
            </span>
            <span className="text-sm font-bold text-gray-900">
              {priority.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
