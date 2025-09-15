// components/NotesList.js
import React from 'react';

const NotesList = ({ notes, onEditNote, onDeleteNote }) => {
  if (notes.length === 0) {
    return (
      <div className="notes-container">
        <div className="section-header">
          <h2>Your Notes</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="section-header">
        <h2>Your Notes ({notes.length})</h2>
      </div>
      
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note._id} className="note-card">
            <div className="note-header">
              <h3>{note.title}</h3>
              <div className="note-actions">
                <button
                  onClick={() => onEditNote(note)}
                  className="btn btn-icon"
                  aria-label="Edit note"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteNote(note._id)}
                  className="btn btn-icon"
                  aria-label="Delete note"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {note.content && (
              <div className="note-content">
                <p>{note.content}</p>
              </div>
            )}
            
            <div className="note-footer">
              <div className="note-dates">
                <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                {note.updated_at !== note.created_at && (
                  <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;