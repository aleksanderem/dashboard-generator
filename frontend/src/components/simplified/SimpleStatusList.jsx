// List with colored status indicators
import Skeleton from '../Skeleton';

export default function SimpleStatusList({ title, items = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const defaultItems = items.length > 0 ? items : [
    { name: 'DC-PROD-01', status: 'online', color: '#10b981' },
    { name: 'DC-PROD-02', status: 'online', color: '#10b981' },
    { name: 'DC-BACKUP', status: 'warning', color: '#f59e0b' },
    { name: 'DC-REMOTE', status: 'online', color: '#10b981' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {showDataSkeleton ? (
          // Show skeleton list items when full skeleton mode
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg"
            >
              <Skeleton width="12px" height="12px" borderRadius="50%" />
              <Skeleton width="80px" height="14px" />
            </div>
          ))
        ) : (
          // Show real data
          defaultItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {showTextSkeleton ? <Skeleton width="80px" height="14px" /> : item.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
