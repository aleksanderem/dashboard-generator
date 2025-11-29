import { Circle } from 'lucide-react';
import Skeleton from '../Skeleton';

export default function SimpleTimelineCard({ title, events = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

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
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="mt-4 overflow-hidden">
        {showDataSkeleton ? (
          // Show skeleton events when full skeleton mode
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 relative">
              <div className="relative flex flex-col items-center">
                <Skeleton width="16px" height="16px" borderRadius="50%" />
                {index < 3 && (
                  <div className="w-0.5 h-full absolute top-4 bg-gray-300" style={{ minHeight: '2rem' }} />
                )}
              </div>
              <div className="flex-1 pb-6">
                <Skeleton width="75%" height="14px" />
                <Skeleton width="50%" height="12px" style={{ marginTop: '4px' }} />
              </div>
            </div>
          ))
        ) : (
          // Show real data
          defaultEvents.map((event, index) => (
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
                <div className="text-sm font-medium text-gray-900">
                  {showTextSkeleton ? <Skeleton width="75%" height="14px" /> : event.text}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {showTextSkeleton ? <Skeleton width="50%" height="12px" /> : event.time}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
