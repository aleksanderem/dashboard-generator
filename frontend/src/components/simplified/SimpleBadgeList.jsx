export default function SimpleBadgeList({ title, badges = [] }) {
  // Generate theme-based colors using color-mix with different intensities
  const getColorStyles = (colorType) => {
    // Different intensity levels for different badge types
    const intensityMap = {
      green: 90,    // Active - brightest
      blue: 75,     // In Progress
      yellow: 85,   // Pending
      red: 70,      // Critical - darker for emphasis
      purple: 80,   // Completed
      gray: 50,     // On Hold - most muted
    };

    const intensity = intensityMap[colorType] || 70;
    const backgroundColor = `color-mix(in srgb, var(--theme-primary) ${100 - intensity}%, white ${intensity}%)`;
    const textColor = intensity > 70 ? '#374151' : '#ffffff'; // Dark text for light backgrounds, white for dark

    return {
      backgroundColor,
      color: textColor,
    };
  };

  // Default badges if none provided
  const defaultBadges = badges.length > 0 ? badges : [
    { text: 'Active', color: 'green' },
    { text: 'In Progress', color: 'blue' },
    { text: 'Pending', color: 'yellow' },
    { text: 'Completed', color: 'purple' },
    { text: 'On Hold', color: 'gray' },
    { text: 'Critical', color: 'red' },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex flex-wrap gap-2 mt-4">
        {defaultBadges.map((badge, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={getColorStyles(badge.color)}
          >
            {badge.text}
          </span>
        ))}
      </div>
    </div>
  );
}
