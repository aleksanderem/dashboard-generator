export default function SimpleProgressBar({ title = 'Progress', percentage = 75, label = 'On track', color = '#14b8a6' }) {
  const progress = Math.min(Math.max(percentage || 0, 0), 100);

  return (
    <div className="simplified-widget">
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title">{title}</div>
        <span className="text-sm font-semibold text-gray-900">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {label && <div className="widget-subtitle mt-2">{label}</div>}
    </div>
  );
}
