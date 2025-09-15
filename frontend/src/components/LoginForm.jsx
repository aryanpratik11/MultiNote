// components/LoginForm.js
import React, { useState } from 'react';

const LoginForm = ({ onLogin, loading, error }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>SaaS Notes</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        <div className="test-accounts">
          <h3>Test Accounts:</h3>
          <div className="account-group">
            <p><strong>Acme:</strong></p>
            <ul>
              <li>admin@acme.test (Admin)</li>
              <li>user@acme.test (Member)</li>
            </ul>
          </div>
          <div className="account-group">
            <p><strong>Globex:</strong></p>
            <ul>
              <li>admin@globex.test (Admin)</li>
              <li>user@globex.test (Member)</li>
            </ul>
          </div>
          <p className="password-note"><em>All passwords: "password"</em></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;