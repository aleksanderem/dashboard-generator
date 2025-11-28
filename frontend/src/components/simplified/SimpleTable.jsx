export default function SimpleTable({ title = 'Data Table', headers = [], rows = [] }) {
  const totalRows = 7; // 1 header + 6 data rows
  const cols = 4; // Number of columns

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex-1 flex flex-col justify-between mt-4 overflow-hidden">
        {/* Table skeleton rows */}
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const isHeader = rowIndex === 0;
          // Header is darkest (0.7), then gradually lighter
          const opacity = isHeader ? 0.7 : Math.max(0.2, 0.7 - rowIndex * 0.1);

          return (
            <div
              key={rowIndex}
              className="w-full border-b border-gray-200 flex"
              style={{ padding: '12px 0' }}
            >
              {/* Columns in each row */}
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex items-center ${colIndex < cols - 1 ? 'border-r border-gray-200 pr-3' : ''}`}
                  style={{
                    width: colIndex === 0 ? '30%' : colIndex === 1 ? '25%' : colIndex === 2 ? '20%' : '25%'
                  }}
                >
                  <div
                    className="h-3 bg-gray-300 rounded flex-1"
                    style={{ opacity }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
