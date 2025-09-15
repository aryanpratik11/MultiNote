// components/NoteForm.js
import React, { useState } from 'react';

const NoteForm = ({ onSubmit, user, notesCount, loading }) => {
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const isFreePlan = user.tenant.subscription_plan === 'free';
  const canCreateNote = !isFreePlan || notesCount < 3 || isEditing;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(noteForm, isEditing, editingNoteId);
    if (!isEditing) {
      setNoteForm({ title: '', content: '' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingNoteId(null);
    setNoteForm({ title: '', content: '' });
  };

  // This would typically be passed from parent when editing
  const startEdit = (note) => {
    setIsEditing(true);
    setEditingNoteId(note._id);
    setNoteForm({ title: note.title, content: note.content });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Note' : 'Create New Note'}
        </h2>
      </div>

      {/* Note Limit Card (visible on free plan when limit is reached) */}
      {!canCreateNote && !isEditing && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center flex flex-col items-center">
          <span className="text-4xl mb-3">📋</span>
          <h3 className="text-xl font-medium text-gray-800">Note Limit Reached</h3>
          <p className="text-gray-500 my-2">
            You've reached the 3-note limit for the Free plan.
          </p>
          {user.role === 'admin' ? (
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Upgrade to Pro for Unlimited Notes
            </button>
          ) : (
            <p className="mt-4 text-sm text-gray-500 italic">
              Ask your admin to upgrade to Pro for unlimited notes.
            </p>
          )}
        </div>
      )}

      {/* Note Form (visible when a new note can be created or an existing one is edited) */}
      {canCreateNote && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              required
              placeholder="Enter note title"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="Enter note content"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Note' : 'Create Note'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default NoteForm;