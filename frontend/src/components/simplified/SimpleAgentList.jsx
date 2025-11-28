// List of top agents with percentages
export default function SimpleAgentList({ title, agents = [] }) {
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
      <div className="widget-title">{title}</div>
      <div className="space-y-3 mt-4 overflow-hidden">
        {defaultAgents.map((agent, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-200 animate-pulse"
                style={{ backgroundColor: agent.avatar || getAvatarColor(index) }}
              />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
              {agent.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
