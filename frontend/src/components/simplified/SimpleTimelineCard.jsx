import { Circle } from 'lucide-react';

export default function SimpleTimelineCard({ title, events = [], showSkeleton = false }) {
  const defaultEvents = events.length > 0 ? events : [
    { text: 'System deployment completed', time: '2 hours ago', status: 'success' },
    { text: 'Database backup initiated', time: '4 hours ago', status: 'success' },
    { text: 'Warning: High memory usage', time: '6 hours ago', status: 'warning' },
    { text: 'New user registration', time: '8 hours ago', status: 'default' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="mt-4 overflow-hidden">
        {defaultEvents.map((event, index) => (
          <div key={index} className="flex items-start gap-3 relative">
            {/* Dot container with connecting line */}
            <div className="relative flex flex-col items-center">
              {/* Colored dot */}
              <div className={`w-4 h-4 rounded-full ${getStatusColor(event.status)} z-10`} />
              {/* Vertical connecting line - only show if not last item */}
              {index < defaultEvents.length - 1 && (
                <div className="w-0.5 h-full absolute top-4 bg-gray-300" style={{ minHeight: '2rem' }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              {showSkeleton ? (
                <>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-900">{event.text}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{event.time}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
