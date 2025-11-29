// Recent items list with priority badges
import Skeleton from '../Skeleton';

export default function SimpleRecentList({ title, items = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const defaultItems = items.length > 0 ? items : [
    { title: 'Server maintenance required', priority: 'MEDIUM', color: '#f59e0b' },
    { title: 'Network connectivity issue', priority: 'HIGH', color: '#f97316' },
    { title: 'Software update available', priority: 'LOW', color: '#10b981' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="space-y-3 mt-4 overflow-hidden">
        {showDataSkeleton ? (
          // Show skeleton list items when full skeleton mode
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <div className="flex-1 min-w-0">
                  <Skeleton width="80%" height="14px" />
                  <Skeleton width="50px" height="12px" style={{ marginTop: '6px' }} />
                </div>
              </div>
              <Skeleton width="60px" height="20px" />
            </div>
          ))
        ) : (
          // Show real data
          defaultItems.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {showTextSkeleton ? <Skeleton width="80%" height="14px" /> : item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {showTextSkeleton ? <Skeleton width="50px" height="12px" /> : 'Just now'}
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
                {showTextSkeleton ? <Skeleton width="50px" height="12px" /> : item.priority}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
