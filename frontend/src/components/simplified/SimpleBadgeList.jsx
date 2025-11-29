import Skeleton from '../Skeleton';

export default function SimpleBadgeList({ title, badges = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

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

  // Varying widths for skeleton badges to look natural
  const skeletonWidths = ['100%', '50%', '95%', '70%', '85%', '60%'];

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div
        className="flex mt-4"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          flexFlow: 'column',
          gap: '1rem',
        }}
      >
        {showDataSkeleton ? (
          // Show skeleton badges when full skeleton mode - vertical layout with varying widths
          Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className="rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, white 90%)',
                color: '#374151',
                position: 'relative',
                width: skeletonWidths[index % skeletonWidths.length],
                height: '17px',
                padding: 0,
              }}
            >
              <Skeleton
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  borderRadius: '50px',
                  top: 0,
                  left: 0,
                }}
              />
            </span>
          ))
        ) : (
          // Show real badges with text skeleton if needed
          defaultBadges.map((badge, index) => (
            showTextSkeleton ? (
              <span
                key={index}
                className="rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, white 90%)',
                  color: '#374151',
                  position: 'relative',
                  width: skeletonWidths[index % skeletonWidths.length],
                  height: '17px',
                  padding: 0,
                }}
              >
                <Skeleton
                  width="100%"
                  height="100%"
                  style={{
                    position: 'absolute',
                    borderRadius: '50px',
                    top: 0,
                    left: 0,
                  }}
                />
              </span>
            ) : (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={getColorStyles(badge.color)}
              >
                {badge.text}
              </span>
            )
          ))
        )}
      </div>
    </div>
  );
}
