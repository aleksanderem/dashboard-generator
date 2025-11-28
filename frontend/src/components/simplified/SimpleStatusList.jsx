// List with colored status indicators
export default function SimpleStatusList({ title, items = [] }) {
  const defaultItems = items.length > 0 ? items : [
    { name: 'DC-PROD-01', status: 'online', color: '#10b981' },
    { name: 'DC-PROD-02', status: 'online', color: '#10b981' },
    { name: 'DC-BACKUP', status: 'warning', color: '#f59e0b' },
    { name: 'DC-REMOTE', status: 'online', color: '#10b981' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {defaultItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm font-medium text-gray-900">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
