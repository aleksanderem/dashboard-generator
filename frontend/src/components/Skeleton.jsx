/**
 * Skeleton Loader Component
 * Used to show loading state with animated placeholder
 */
export default function Skeleton({
  width = '100%',
  height = '1em',
  className = '',
  variant = 'text', // 'text', 'circular', 'rectangular'
  style = {},
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: width,
          height: width, // Make it square for circular
        };
      case 'rectangular':
        return {
          borderRadius: '8px',
          width,
          height,
        };
      case 'text':
      default:
        return {
          borderRadius: '4px',
          width,
          height,
        };
    }
  };

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        ...getVariantStyles(),
        backgroundColor: '#e0e0e0',
        background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
