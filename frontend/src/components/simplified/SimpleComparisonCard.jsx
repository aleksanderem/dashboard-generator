import { ArrowRight } from 'lucide-react';

export default function SimpleComparisonCard({ title, valueA, valueB, labelA = 'Current', labelB = 'Previous' }) {
  const numA = parseFloat(valueA) || 0;
  const numB = parseFloat(valueB) || 0;
  const diff = ((numA - numB) / numB) * 100;
  const isPositive = diff > 0;

  return (
    <div className="simplified-widget">
      <div className="widget-title">{title}</div>
      <div className="flex items-center justify-around flex-1">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">{labelA}</div>
          <div className="text-3xl font-bold text-gray-900">{valueA}</div>
        </div>
        <ArrowRight className="w-6 h-6 text-gray-400" />
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">{labelB}</div>
          <div className="text-3xl font-bold text-gray-900">{valueB}</div>
        </div>
      </div>
      {!isNaN(diff) && (
        <div className={`text-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{diff.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
