// components/Header.js
import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Brand and Tenant Info */}
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-blue-600">MultiNotes</h1>
          <div className="flex flex-col text-sm text-gray-500">
            <span className="font-semibold">{user.tenant.name}</span>
            <span 
              className={`font-medium px-2 py-1 rounded-full text-xs
              ${user.tenant.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}`}
            >
              {user.tenant.subscription_plan.toUpperCase()}
            </span>
          </div>
        </div>

        {/* User Menu and Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right text-sm">
            <span className="font-semibold text-gray-800">{user.email}</span>
            <span className="text-gray-500 capitalize">{user.role}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;