import { ArrowRight } from 'lucide-react';
import Skeleton from '../Skeleton';

export default function SimpleComparisonCard({ title, valueA, valueB, labelA = 'Current', labelB = 'Previous', skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const numA = parseFloat(valueA) || 0;
  const numB = parseFloat(valueB) || 0;
  const diff = ((numA - numB) / numB) * 100;
  const isPositive = diff > 0;

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="flex items-center justify-around flex-1">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">
            {showTextSkeleton ? <Skeleton width="60px" height="14px" /> : labelA}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {showTextSkeleton ? <Skeleton width="80px" height="32px" /> : valueA}
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-gray-400" />
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">
            {showTextSkeleton ? <Skeleton width="60px" height="14px" /> : labelB}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {showTextSkeleton ? <Skeleton width="80px" height="32px" /> : valueB}
          </div>
        </div>
      </div>
      {!isNaN(diff) && (
        <div className={`text-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {showTextSkeleton ? <Skeleton width="60px" height="14px" /> : `${isPositive ? '+' : ''}${diff.toFixed(1)}%`}
        </div>
      )}
    </div>
  );
}
