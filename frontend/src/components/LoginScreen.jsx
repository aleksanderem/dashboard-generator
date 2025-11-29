import { useState } from 'react';
import { Mail, Key, ArrowRight, Copy, Check } from 'lucide-react';
import { loginByEmail } from '../utils/sessionManager';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(null); // Shows API key after first login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await loginByEmail(email);

      // If new user, show API key before proceeding
      if (session.is_new) {
        setShowApiKey(session.session_key);
      } else {
        onLoginSuccess(session);
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    onLoginSuccess({ session_key: showApiKey, email });
  };

  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(showApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show API key screen for new users
  if (showApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your API Key
            </h1>
            <p className="text-gray-600">
              Save this key - you'll need it for API access (WordPress plugin, etc.)
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">API Key:</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <code className="block text-sm font-mono text-gray-800 break-all bg-white p-3 rounded border border-gray-200">
              {showApiKey}
            </code>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This key is tied to your email ({email}).
              You can always get it again by logging in with the same email.
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard AI Generator
          </h1>
          <p className="text-gray-600">
            Enter your email to get started. We'll create an API key for you.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>No password required. Just enter your email.</p>
          <p className="mt-1">Returning users will get their existing API key.</p>
        </div>
      </div>
    </div>
  );
}
