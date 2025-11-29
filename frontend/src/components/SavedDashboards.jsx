import { useState, useEffect } from 'react';
import { Database, Loader2, Trash2, Eye, AlertCircle, ArrowLeft, Download, Copy, Check, Code, X, CheckSquare, Square, Palette, Edit3 } from 'lucide-react';
import { fetchDashboards, deleteDashboard, updateDashboard, fetchDashboardById } from '../utils/api';
import JSZip from 'jszip';

export default function SavedDashboards({ onLoadDashboard, onClose }) {
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // New states for enhanced features
  const [copiedId, setCopiedId] = useState(null);
  const [apiModalId, setApiModalId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionModal, setBulkActionModal] = useState(null); // 'theme' | 'title' | null
  const [bulkTheme, setBulkTheme] = useState('teal');
  const [bulkTitle, setBulkTitle] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const themeOptions = [
    { value: 'teal', label: 'Teal' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'itsm', label: 'ITSM' },
    { value: 'security', label: 'Security' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'ad', label: 'AD' },
    { value: 'uem', label: 'UEM' },
  ];

  // Copy dashboard ID to clipboard
  const copyDashboardId = async (id) => {
    try {
      await navigator.clipboard.writeText(id.toString());
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle selection for bulk actions
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === dashboards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dashboards.map(d => d._id)));
    }
  };

  // Download single dashboard as full-size PNG (rendered via Playwright)
  const downloadPNG = async (dashboard) => {
    setDownloadingId(dashboard._id);
    try {
      // Use render endpoint for full-size image
      const response = await fetch(`/api/dashboards/${dashboard._id}/render.png`);
      if (!response.ok) {
        throw new Error('Failed to render dashboard');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${dashboard.name || 'dashboard'}-${dashboard._id}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download dashboard image');
    } finally {
      setDownloadingId(null);
    }
  };

  // Bulk download as ZIP (full-size renders)
  const bulkDownloadZip = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkProcessing(true);
    try {
      const zip = new JSZip();
      const selectedDashboards = dashboards.filter(d => selectedIds.has(d._id));

      for (const dashboard of selectedDashboards) {
        try {
          // Fetch full-size render for each dashboard
          const response = await fetch(`/api/dashboards/${dashboard._id}/render.png`);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(`${dashboard.name || 'dashboard'}-${dashboard._id}.png`, blob);
          }
        } catch (e) {
          console.warn(`Failed to render dashboard ${dashboard._id}:`, e);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = `dashboards-${Date.now()}.zip`;
      link.href = URL.createObjectURL(content);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Bulk download failed:', err);
      setError('Failed to create ZIP file');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk update theme
  const bulkUpdateTheme = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkProcessing(true);
    try {
      const selectedDashboards = dashboards.filter(d => selectedIds.has(d._id));

      for (const dashboard of selectedDashboards) {
        const fullDashboard = await fetchDashboardById(dashboard._id);
        const updatedDashboardData = {
          ...fullDashboard.dashboard,
          theme: bulkTheme
        };
        await updateDashboard(
          dashboard._id,
          fullDashboard.name,
          updatedDashboardData,
          bulkTheme,
          fullDashboard.appName,
          fullDashboard.appCategory,
          fullDashboard.thumbnail
        );
      }

      // Reload dashboards
      await loadDashboards();
      setBulkActionModal(null);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk theme update failed:', err);
      setError('Failed to update themes');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk update title
  const bulkUpdateTitle = async () => {
    if (selectedIds.size === 0 || !bulkTitle.trim()) return;

    setIsBulkProcessing(true);
    try {
      const selectedDashboards = dashboards.filter(d => selectedIds.has(d._id));

      for (let i = 0; i < selectedDashboards.length; i++) {
        const dashboard = selectedDashboards[i];
        const fullDashboard = await fetchDashboardById(dashboard._id);
        const newName = selectedDashboards.length > 1
          ? `${bulkTitle} (${i + 1})`
          : bulkTitle;
        await updateDashboard(
          dashboard._id,
          newName,
          fullDashboard.dashboard,
          fullDashboard.dashboard?.theme,
          fullDashboard.appName,
          fullDashboard.appCategory,
          fullDashboard.thumbnail
        );
      }

      // Reload dashboards
      await loadDashboards();
      setBulkActionModal(null);
      setBulkTitle('');
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk title update failed:', err);
      setError('Failed to update titles');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Get API base URL for examples
  const getApiBaseUrl = () => {
    return window.location.origin;
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

      {/* Bulk Actions Bar */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {selectedIds.size === dashboards.length ? (
            <CheckSquare className="w-4 h-4 text-teal-600" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {selectedIds.size === dashboards.length ? 'Deselect All' : 'Select All'}
        </button>

        {selectedIds.size > 0 && (
          <>
            <span className="text-sm text-gray-500">
              {selectedIds.size} selected
            </span>
            <div className="h-6 w-px bg-gray-300" />
            <button
              onClick={bulkDownloadZip}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download ZIP
            </button>
            <button
              onClick={() => setBulkActionModal('theme')}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Palette className="w-4 h-4" />
              Change Theme
            </button>
            <button
              onClick={() => setBulkActionModal('title')}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              Change Title
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard._id}
            className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${
              selectedIds.has(dashboard._id) ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'
            }`}
          >
            {/* Selection Checkbox */}
            <button
              onClick={() => toggleSelection(dashboard._id)}
              className="absolute top-3 left-3 z-10 w-6 h-6 bg-white rounded shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {selectedIds.has(dashboard._id) ? (
                <CheckSquare className="w-5 h-5 text-teal-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Thumbnail Preview */}
            {dashboard.thumbnail ? (
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={dashboard.thumbnail}
                  alt={dashboard.name || 'Dashboard preview'}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No preview available</p>
                </div>
              </div>
            )}

            {/* Card Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                  {dashboard.name || 'Untitled Dashboard'}
                </h3>
                <div
                  className="px-2 py-0.5 rounded text-white text-xs font-bold uppercase tracking-wide flex-shrink-0"
                  style={{ backgroundColor: getThemeColor(dashboard.dashboard?.theme || 'teal') }}
                >
                  {dashboard.dashboard?.theme || 'teal'}
                </div>
              </div>

              {/* Dashboard ID */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 font-mono">ID: {dashboard._id}</span>
                <button
                  onClick={() => copyDashboardId(dashboard._id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy ID"
                >
                  {copiedId === dashboard._id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(dashboard.createdAt)}</span>
                <span>{dashboard.dashboard?.gridLayout?.length || 0} widgets</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => onLoadDashboard(dashboard._id)}
                className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Load
              </button>
              <button
                onClick={() => downloadPNG(dashboard)}
                disabled={downloadingId === dashboard._id}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Download PNG"
              >
                {downloadingId === dashboard._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setApiModalId(dashboard._id)}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                title="API Examples"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDeleteId(dashboard._id)}
                disabled={deletingId === dashboard._id}
                className="px-3 py-2 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* API Examples Modal */}
      {apiModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">API Examples</h3>
              <button
                onClick={() => setApiModalId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Fetch Dashboard */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Fetch Dashboard (GET)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`curl "${getApiBaseUrl()}/api/dashboards/${apiModalId}"`}
                    </pre>
                  </div>
                </div>

                {/* JavaScript Fetch */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">JavaScript (Fetch API)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`const response = await fetch('${getApiBaseUrl()}/api/dashboards/${apiModalId}');
const data = await response.json();
console.log(data.dashboard);`}
                    </pre>
                  </div>
                </div>

                {/* View in Browser */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Direct URL (View in Browser)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`${getApiBaseUrl()}/?id=${apiModalId}`}
                    </pre>
                  </div>
                </div>

                {/* With Skeleton Mode */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">With Skeleton Mode</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`${getApiBaseUrl()}/?id=${apiModalId}&skeleton=true`}
                    </pre>
                  </div>
                </div>

                {/* With Custom Theme */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">With Different Theme</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`${getApiBaseUrl()}/?id=${apiModalId}&theme=blue`}
                    </pre>
                  </div>
                </div>

                {/* Get Thumbnail URL */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Get Thumbnail URL (JSON)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`curl "${getApiBaseUrl()}/api/dashboards/${apiModalId}/thumbnail"

# Response:
# { "success": true, "thumbnailUrl": "data:image/png;base64,..." }`}
                    </pre>
                  </div>
                </div>

                {/* Get Thumbnail Image */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Download Thumbnail (PNG)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
{`# Direct thumbnail URL (can be used in <img> tags)
${getApiBaseUrl()}/api/dashboards/${apiModalId}/thumbnail.png

# Download with curl:
curl -o thumbnail.png "${getApiBaseUrl()}/api/dashboards/${apiModalId}/thumbnail.png"`}
                    </pre>
                  </div>
                </div>

                {/* Render Full-Size Image */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Render Full-Size Image (PNG)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-blue-400 font-mono whitespace-pre-wrap break-all">
{`# Default 1920x1080:
${getApiBaseUrl()}/api/dashboards/${apiModalId}/render.png

# Custom size (max 3840x2160):
${getApiBaseUrl()}/api/dashboards/${apiModalId}/render.png?width=2560&height=1440

# With different theme:
${getApiBaseUrl()}/api/dashboards/${apiModalId}/render.png?theme=blue

# Download with curl:
curl -o dashboard-full.png "${getApiBaseUrl()}/api/dashboards/${apiModalId}/render.png"

# Download 4K version:
curl -o dashboard-4k.png "${getApiBaseUrl()}/api/dashboards/${apiModalId}/render.png?width=3840&height=2160"`}
                    </pre>
                  </div>
                </div>

                {/* Delete Dashboard */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Delete Dashboard (DELETE)</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap break-all">
{`curl -X DELETE "${getApiBaseUrl()}/api/dashboards/${apiModalId}"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiModalId.toString());
                  setCopiedId(apiModalId);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copiedId === apiModalId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                Copy Dashboard ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Theme Modal */}
      {bulkActionModal === 'theme' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Theme</h3>
              <button
                onClick={() => setBulkActionModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Change theme for {selectedIds.size} selected dashboard{selectedIds.size !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBulkTheme(opt.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      bulkTheme === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: getThemeColor(opt.value) }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => setBulkActionModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={bulkUpdateTheme}
                disabled={isBulkProcessing}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBulkProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Title Modal */}
      {bulkActionModal === 'title' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Title</h3>
              <button
                onClick={() => setBulkActionModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {selectedIds.size > 1
                  ? `Set base title for ${selectedIds.size} dashboards (will be numbered automatically)`
                  : 'Set new title for the selected dashboard'}
              </p>
              <input
                type="text"
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                placeholder="Enter new title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              {selectedIds.size > 1 && bulkTitle && (
                <p className="text-xs text-gray-500 mt-2">
                  Preview: "{bulkTitle} (1)", "{bulkTitle} (2)", ...
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setBulkActionModal(null);
                  setBulkTitle('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={bulkUpdateTitle}
                disabled={isBulkProcessing || !bulkTitle.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBulkProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Apply Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
