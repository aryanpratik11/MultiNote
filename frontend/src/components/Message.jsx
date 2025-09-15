import React from 'react';

export default function Message({ error, success }) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md shadow-sm mb-4">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md shadow-sm mb-4">
          <p className="font-semibold text-sm">{success}</p>
        </div>
      )}
    </>
  );
}