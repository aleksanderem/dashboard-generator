// List of top agents with percentages
import Skeleton from '../Skeleton';

export default function SimpleAgentList({ title, agents = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  // Generate theme-based avatar colors
  const getAvatarColor = (index) => {
    const shades = [
      'color-mix(in srgb, var(--theme-primary) 40%, white)',
      'color-mix(in srgb, var(--theme-primary) 35%, white)',
      'color-mix(in srgb, var(--theme-primary) 30%, white)',
      'color-mix(in srgb, var(--theme-primary) 25%, white)',
    ];
    return shades[index % shades.length];
  };

  const defaultAgents = agents.length > 0 ? agents : [
    { name: 'Agent 1', tasks: 45, percentage: 98 },
    { name: 'Agent 2', tasks: 38, percentage: 95 },
    { name: 'Agent 3', tasks: 41, percentage: 94 },
    { name: 'Agent 4', tasks: 35, percentage: 91 },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="space-y-3 mt-4 overflow-hidden">
        {showDataSkeleton ? (
          // Show skeleton list items when full skeleton mode
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <div>
                  <Skeleton width="96px" height="12px" />
                  <Skeleton width="64px" height="10px" style={{ marginTop: '6px' }} />
                </div>
              </div>
              <Skeleton width="60px" height="32px" />
            </div>
          ))
        ) : (
          // Show real data
          defaultAgents.map((agent, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-200"
                  style={{ backgroundColor: agent.avatar || getAvatarColor(index) }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {showTextSkeleton ? <Skeleton width="96px" height="12px" /> : agent.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {showTextSkeleton ? <Skeleton width="64px" height="10px" /> : `${agent.tasks} tasks`}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                {showTextSkeleton ? <Skeleton width="50px" height="24px" /> : `${agent.percentage}%`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
