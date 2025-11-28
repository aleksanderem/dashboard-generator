export default function SimpleHeatmap({ title, data = [] }) {
  // Default data if none provided - 7x5 grid
  const defaultData = [
    [45, 67, 89, 34, 56, 78, 23],
    [23, 56, 78, 90, 45, 67, 89],
    [67, 89, 34, 56, 78, 23, 45],
    [89, 45, 67, 23, 34, 56, 78],
    [34, 78, 23, 67, 89, 45, 56]
  ];

  // Use provided data or fallback to default
  const heatmapData = (!data || data.length === 0) ? defaultData : data;

  // Generate theme-based color using CSS color-mix with intensity
  const getColor = (value) => {
    const intensity = Math.min(value / 100, 1);
    // Use color-mix to blend theme primary color with white based on intensity
    // Low values = more white (lighter), high values = more theme color (darker)
    const whitePercent = Math.round((1 - intensity) * 80); // 0-80% white
    return `color-mix(in srgb, var(--theme-primary) ${100 - whitePercent}%, white ${whitePercent}%)`;
  };

  const getTextColor = (value) => {
    // Use white text for darker cells (high values), dark text for lighter cells (low values)
    const intensity = Math.min(value / 100, 1);
    return intensity > 0.5 ? '#ffffff' : '#374151';
  };

  return (
    <div className="simplified-widget" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="widget-title">{title}</div>
      <div
        className="grid gap-1 mt-4"
        style={{
          gridTemplateColumns: `repeat(${heatmapData[0]?.length || 7}, 1fr)`,
          gridTemplateRows: `repeat(${heatmapData.length}, 1fr)`,
          flex: 1,
          height: '100%'
        }}
      >
        {heatmapData.flat().map((value, index) => (
          <div
            key={index}
            className="rounded flex items-center justify-center"
            style={{
              backgroundColor: getColor(value)
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: getTextColor(value) }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
