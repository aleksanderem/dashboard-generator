import { useState, useEffect } from 'react';

/**
 * Hook to get the current theme color from CSS variables
 * Listens for 'themechange' custom event
 */
export default function useThemeColor() {
  const getColor = () => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-primary')
      .trim();
    return color || '#14B8A6';
  };

  const [themeColor, setThemeColor] = useState(getColor);

  useEffect(() => {
    const updateColor = () => {
      const newColor = getColor();
      setThemeColor(newColor);
    };

    // Listen for custom theme change event
    window.addEventListener('themechange', updateColor);

    // Also use MutationObserver as backup
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => {
      window.removeEventListener('themechange', updateColor);
      observer.disconnect();
    };
  }, []);

  return themeColor;
}
