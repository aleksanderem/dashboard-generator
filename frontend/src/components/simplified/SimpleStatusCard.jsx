import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import Skeleton from '../Skeleton';

export default function SimpleStatusCard({ title = 'Status', items = [], skeleton = false }) {
  // skeleton can be: false, 'title', 'semi', or 'full'
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' || skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  const defaultItems = items.length > 0 ? items : [
    { status: 'success', label: 'Active Users', value: '1,245' },
    { status: 'warning', label: 'Pending Tasks', value: '23' },
    { status: 'success', label: 'Completed', value: '89' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="simplified-widget">
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>
      <div className="space-y-3 mt-4">
        {defaultItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span className="text-sm text-gray-700">
                {showTextSkeleton ? <Skeleton width="100px" height="14px" /> : item.label}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {showTextSkeleton ? <Skeleton width="60px" height="14px" /> : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
