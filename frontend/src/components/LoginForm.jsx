import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Copy } from 'lucide-react';

// Test accounts for easy reference
const testAccounts = [
  { email: 'admin@acme.test', password: 'password', label: 'Acme Admin' },
  { email: 'user@acme.test', password: 'password', label: 'Acme User' },
  { email: 'admin@globex.test', password: 'password', label: 'Globex Admin' },
  { email: 'user@globex.test', password: 'password', label: 'Globex User' },
];

const LoginForm = ({ onLogin = () => {}, loading = false, error = null }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  const handleQuickFill = (account) => {
    setLoginForm({ email: account.email, password: account.password });
    setShowTestAccounts(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">MultiNotes</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                placeholder="Enter your password"
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold 
                       text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 transition duration-300 
                       disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>

        {/* Test Accounts Section */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="w-full text-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
          >
            {showTestAccounts ? '▼ Hide Test Accounts' : '▶ Show Test Accounts'}
          </button>
          
          {showTestAccounts && (
            <div className="mt-3 space-y-2">
              {testAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-700">{account.label}</div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(account.email)}
                      className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      title="Copy email"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => handleQuickFill(account)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-400 text-center italic mt-2">
                All passwords: "password"
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-4 text-xs text-center text-gray-400">
          🔒 Demo environment - test credentials only
        </div>
      </div>
    </div>
  );
};

export default LoginForm;