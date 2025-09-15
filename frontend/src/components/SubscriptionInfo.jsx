// components/SubscriptionInfo.js
import React from 'react';

const SubscriptionInfo = ({ user, notesCount, onUpgrade, loading }) => {
  const isFreePlan = user.tenant.subscription_plan === 'free';
  const notesLimitReached = isFreePlan && notesCount >= 3;
  
  return (
    <div className="subscription-info">
      <div className="plan-details">
        <div className="plan-name">
          Current Plan: <span className={user.tenant.subscription_plan}>
            {user.tenant.subscription_plan.toUpperCase()}
          </span>
        </div>
        
        {isFreePlan && (
          <div className="usage">
            <span className="usage-text">
              {notesCount}/3 notes used
            </span>
            <div className="usage-bar">
              <div 
                className="usage-progress" 
                style={{ width: `${(notesCount / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {isFreePlan && user.role === 'admin' && (
        <div className="upgrade-section">
          <p>Unlock unlimited notes with Pro plan</p>
          <button 
            onClick={onUpgrade} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Upgrading...' : 'Upgrade to Pro'}
          </button>
        </div>
      )}
      
      {notesLimitReached && user.role !== 'admin' && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
          <p>You've reached the 3-note limit. Ask your admin to upgrade to Pro.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;