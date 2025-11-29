// Priority list with colored badges
import Skeleton from '../Skeleton';

export default function SimplePriorityList({ title, priorities = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const defaultPriorities = priorities.length > 0 ? priorities : [
    { label: 'Low', count: 124, color: '#10b981' },
    { label: 'Medium', count: 178, color: '#f59e0b' },
    { label: 'High', count: 39, color: '#f97316' },
    { label: 'Critical', count: 6, color: '#dc2626' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {defaultPriorities.map((priority, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: priority.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {showTextSkeleton ? <Skeleton width="80px" height="14px" /> : `${priority.label}:`}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {showTextSkeleton ? <Skeleton width="40px" height="14px" /> : priority.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
