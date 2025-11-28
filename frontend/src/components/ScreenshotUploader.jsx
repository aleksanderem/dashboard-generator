import { useState, useCallback } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

export default function ScreenshotUploader({
  onAnalysisComplete,
  onAnalysisError,
  isAnalyzing,
  setIsAnalyzing,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress('Uploading screenshot...');

    try {
      const formData = new FormData();
      formData.append('screenshot', selectedFile);

      setProgress('Analyzing with Claude Vision AI...');

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      });

      setProgress('Mapping widgets...');

      // Simulate brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress('Generating dashboard...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (response.data.success) {
        const dashboard = response.data.dashboard;

        // Check confidence score if available
        if (dashboard.analysis) {
          const { confidence, canRender, issues } = dashboard.analysis;

          console.log('Analysis confidence:', confidence, '%');
          console.log('Can render:', canRender);
          console.log('Issues:', issues);

          // Block rendering if confidence is too low
          if (!canRender || confidence < 50) {
            throw new Error(
              `Analysis quality too low (${confidence}%). Cannot render dashboard. Issues: ${issues.join(', ')}`
            );
          }

          // Show warning for low confidence (but still renderable)
          if (confidence < 90) {
            console.warn(
              `Analysis confidence: ${confidence}%. Some widgets may be incomplete. Issues: ${issues.join(', ')}`
            );
          }
        }

        onAnalysisComplete(dashboard);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      onAnalysisError(
        error.response?.data?.message ||
          error.message ||
          'Failed to analyze dashboard'
      );
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
          ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!previewUrl ? (
          <>
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Dashboard Screenshot
            </h3>
            <p className="text-gray-500 mb-6">
              Drag and drop your dashboard screenshot here, or click to browse
            </p>
            <label className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 cursor-pointer transition-colors">
              <ImageIcon className="w-5 h-5 mr-2" />
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={isAnalyzing}
              />
            </label>
            <p className="text-xs text-gray-400 mt-4">
              Supports PNG, JPG, JPEG (max 10MB)
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Dashboard preview"
              className="max-h-96 mx-auto rounded-lg shadow-lg"
            />
            <div className="flex items-center justify-center gap-4">
              <label className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 cursor-pointer transition-colors">
                Change File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isAnalyzing}
                />
              </label>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="inline-flex items-center px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Analyze & Generate
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {isAnalyzing && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{progress}</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 animate-pulse-slow rounded-full w-2/3"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Step 1</div>
              <div className="text-sm font-medium text-gray-900">
                Analyzing Layout
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Step 2</div>
              <div className="text-sm font-medium text-gray-900">
                Mapping Widgets
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Step 3</div>
              <div className="text-sm font-medium text-gray-900">
                Generating View
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Examples Section */}
      {!previewUrl && !isAnalyzing && (
        <div className="mt-12">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            How it works
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-teal-600" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">
                1. Upload Screenshot
              </h5>
              <p className="text-sm text-gray-600">
                Upload a screenshot of any complex dashboard (Analytics Plus,
                Google Analytics, etc.)
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-teal-600" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">
                2. AI Analysis
              </h5>
              <p className="text-sm text-gray-600">
                Claude Vision AI identifies widgets, positions, and data to map
                them to simplified components
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">
                3. Beautiful Dashboard
              </h5>
              <p className="text-sm text-gray-600">
                Get a clean, minimal dashboard with simplified widgets that
                preserve your original layout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
