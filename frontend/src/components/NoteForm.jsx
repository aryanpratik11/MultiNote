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
    <div className="note-form-container">
      <div className="section-header">
        <h2>{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
      </div>
      
      {!canCreateNote && !isEditing && (
        <div className="limit-card">
          <div className="limit-icon">📋</div>
          <h3>Note Limit Reached</h3>
          <p>You've reached the 3-note limit for the Free plan.</p>
          {user.role === 'admin' ? (
            <button className="btn btn-primary">
              Upgrade to Pro for Unlimited Notes
            </button>
          ) : (
            <p className="admin-notice">Ask your admin to upgrade to Pro for unlimited notes.</p>
          )}
        </div>
      )}
      
      {canCreateNote && (
        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
              required
              placeholder="Enter note title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={noteForm.content}
              onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
              placeholder="Enter note content"
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Note' : 'Create Note'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn btn-outline"
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