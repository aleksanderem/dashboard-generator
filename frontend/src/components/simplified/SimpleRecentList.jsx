// Recent items list with priority badges
export default function SimpleRecentList({ title, items = [] }) {
  const defaultItems = items.length > 0 ? items : [
    { title: 'Server maintenance required', priority: 'MEDIUM', color: '#f59e0b' },
    { title: 'Network connectivity issue', priority: 'HIGH', color: '#f97316' },
    { title: 'Software update available', priority: 'LOW', color: '#10b981' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="space-y-3 mt-4 overflow-hidden">
        {defaultItems.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Just now
                </div>
              </div>
            </div>
            <span
              className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide flex-shrink-0"
              style={{
                backgroundColor: item.color + '20',
                color: item.color,
              }}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
