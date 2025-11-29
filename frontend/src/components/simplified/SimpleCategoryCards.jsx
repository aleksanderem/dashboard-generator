// Grid of category cards with counts
import Skeleton from '../Skeleton';

export default function SimpleCategoryCards({ title, categories = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

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
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
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
              {showTextSkeleton ? <Skeleton width="50px" height="28px" /> : category.count}
            </div>
            <div className="text-sm text-gray-700">
              {showTextSkeleton ? <Skeleton width="80%" height="12px" /> : category.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
