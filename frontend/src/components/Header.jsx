// components/Header.js
import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <h1>SaaS Notes</h1>
          <div className="tenant-info">
            <span className="tenant-name">{user.tenant.name}</span>
            <span className={`tenant-plan ${user.tenant.subscription_plan}`}>
              {user.tenant.subscription_plan.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;