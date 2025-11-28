// Grid of category cards with counts
export default function SimpleCategoryCards({ title, categories = [] }) {
  // Generate theme-based color shades
  const getThemeShade = (index) => {
    const shades = [
      'var(--theme-primary-light)',
      'color-mix(in srgb, var(--theme-primary) 30%, white)',
      'color-mix(in srgb, var(--theme-primary) 20%, white)',
      'color-mix(in srgb, var(--theme-primary) 15%, white)',
    ];
    return shades[index % shades.length];
  };

  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Hardware Issues', count: 124 },
    { name: 'Software', count: 98 },
    { name: 'Network', count: 67 },
    { name: 'Access & Permissions', count: 58 },
  ];

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="grid grid-cols-2 gap-4 mt-4 overflow-hidden">
        {defaultCategories.map((category, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: 'var(--theme-primary-dark)' }}
            >
              {category.count}
            </div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
