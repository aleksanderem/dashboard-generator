import { useState, useEffect } from 'react';
import { Database, Loader2, Trash2, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import { fetchDashboards, deleteDashboard } from '../utils/api';

export default function SavedDashboards({ onLoadDashboard, onClose }) {
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboards();
      setDashboards(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (dashboardId) => {
    setDeletingId(dashboardId);
    try {
      await deleteDashboard(dashboardId);
      setDashboards(dashboards.filter(d => d._id !== dashboardId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete dashboard');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThemeColor = (theme) => {
    const themeColors = {
      teal: '#14B8A6',
      blue: '#3B82F6',
      purple: '#A855F7',
      orange: '#F97316',
      red: '#EF4444',
      green: '#10B981',
      itsm: '#C92133',
      security: '#991B1B',
      monitoring: '#F97316',
      ad: '#138D8F',
      uem: '#10B981'
    };
    return themeColors[theme] || '#14B8A6';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Dashboards</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2 mt-4">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded w-10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Dashboards</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboards</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboards}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (dashboards.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Dashboards</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Dashboards Yet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Upload a screenshot to analyze and save your first dashboard
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Upload Screenshot
          </button>
        </div>
      </div>
    );
  }

  // Dashboard List
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Dashboards</h2>
            <p className="text-sm text-gray-500">{dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard._id}
            className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
          >
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {dashboard.name || 'Untitled Dashboard'}
                </h3>
                <div
                  className="px-2 py-1 rounded text-white text-xs font-bold uppercase tracking-wide flex-shrink-0"
                  style={{ backgroundColor: getThemeColor(dashboard.dashboard?.theme || 'teal') }}
                >
                  {dashboard.dashboard?.theme || 'teal'}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(dashboard.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Widgets</span>
                  <span className="text-gray-900 font-medium">
                    {dashboard.dashboard?.gridLayout?.length || 0} components
                  </span>
                </div>
              </div>

              {/* Preview Text */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  Click to load dashboard
                </p>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => onLoadDashboard(dashboard._id)}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Load
              </button>
              <button
                onClick={() => setConfirmDeleteId(dashboard._id)}
                disabled={deletingId === dashboard._id}
                className="px-4 py-2.5 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete dashboard"
              >
                {deletingId === dashboard._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Delete Confirmation */}
            {confirmDeleteId === dashboard._id && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Delete Dashboard?</h4>
                  <p className="text-xs text-gray-600 mb-4">This action cannot be undone</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(dashboard._id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
