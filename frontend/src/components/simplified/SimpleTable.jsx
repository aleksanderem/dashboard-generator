import { useState, useEffect, useRef, useMemo } from 'react';
import Skeleton from '../Skeleton';

export default function SimpleTable({ title = 'Data Table', headers = [], rows = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const containerRef = useRef(null);
  const tableRef = useRef(null);

  // State for visible columns and rows
  const [visibleCols, setVisibleCols] = useState(null);
  const [visibleRows, setVisibleRows] = useState(null);

  // Memoize default data to prevent infinite loops
  const defaultHeaders = useMemo(() =>
    headers.length > 0 ? headers : ['Name', 'Status', 'Value', 'Date'],
    [headers]
  );

  const defaultRows = useMemo(() =>
    rows.length > 0 ? rows : [
      ['Project A', 'Active', '$1,234', '2024-01-15'],
      ['Project B', 'Pending', '$856', '2024-01-14'],
      ['Project C', 'Complete', '$2,100', '2024-01-13'],
      ['Project D', 'Active', '$945', '2024-01-12'],
    ],
    [rows]
  );

  // Calculate visible columns and rows based on container size
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !tableRef.current) return;

      const container = containerRef.current;
      const table = tableRef.current;

      // Check overflow
      const hasHorizontalScroll = table.scrollWidth > container.clientWidth;
      const hasVerticalScroll = table.scrollHeight > container.clientHeight;

      let newCols = defaultHeaders.length;
      let newRows = defaultRows.length;

      // Reduce columns if horizontal scroll
      if (hasHorizontalScroll && newCols > 2) {
        const avgColWidth = table.scrollWidth / defaultHeaders.length;
        const fitCols = Math.floor(container.clientWidth / avgColWidth);
        newCols = Math.max(2, Math.min(fitCols, defaultHeaders.length));
      }

      // Reduce rows if vertical scroll
      if (hasVerticalScroll && newRows > 2) {
        const headerHeight = 36;
        const rowHeight = 36;
        const availableHeight = container.clientHeight - headerHeight;
        const fitRows = Math.floor(availableHeight / rowHeight);
        newRows = Math.max(2, Math.min(fitRows, defaultRows.length));
      }

      setVisibleCols(newCols);
      setVisibleRows(newRows);
    };

    // Initial check after render
    const timeoutId = setTimeout(checkOverflow, 50);

    // Recheck on resize
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkOverflow, 50);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [defaultHeaders, defaultRows]);

  // Get visible data
  const displayHeaders = visibleCols !== null
    ? defaultHeaders.slice(0, visibleCols)
    : defaultHeaders;

  const displayRows = visibleRows !== null
    ? defaultRows.slice(0, visibleRows)
    : defaultRows;

  // Adjust rows to match visible columns
  const adjustedRows = displayRows.map(row =>
    visibleCols !== null ? row.slice(0, visibleCols) : row
  );

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div
        ref={containerRef}
        className="mt-2 flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <table ref={tableRef} className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {displayHeaders.map((header, i) => (
                <th key={i} className="text-left py-2 px-3 font-medium text-gray-700 whitespace-nowrap">
                  {showTextSkeleton ? <Skeleton width="60px" height="14px" /> : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showDataSkeleton ? (
              Array.from({ length: Math.min(4, visibleRows || 4) }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {displayHeaders.map((_, j) => (
                    <td key={j} className="py-2 px-3 text-gray-600">
                      <Skeleton width="80px" height="14px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              adjustedRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3 text-gray-600 whitespace-nowrap">
                      {showTextSkeleton ? <Skeleton width="80px" height="14px" /> : cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
