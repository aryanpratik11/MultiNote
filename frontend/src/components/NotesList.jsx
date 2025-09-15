import React from 'react';

const NotesList = ({ notes, onEditNote, onDeleteNote }) => {
  if (notes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Notes</h2>
        </div>
        <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-lg">
          <span className="text-5xl mb-3">📝</span>
          <h3 className="text-xl font-medium text-gray-800">No notes yet</h3>
          <p className="text-gray-500 mt-2">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Your Notes ({notes.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {notes.map(note => (
          <div key={note._id} className="note-card bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col justify-between h-full">
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 truncate pr-2">{note.title}</h3>
                <div className="flex space-x-2 text-gray-400">
                  <button
                    onClick={() => onEditNote(note)}
                    className="hover:text-blue-500 transition"
                    aria-label="Edit note"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteNote(note._id)}
                    className="hover:text-red-500 transition"
                    aria-label="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {note.content && (
                <div className="text-gray-600 text-sm overflow-hidden flex-grow line-clamp-4">
                  <p>{note.content}</p>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between flex-wrap">
                <span className="truncate mr-2">Created: {new Date(note.created_at).toLocaleDateString()}</span>
                {note.updated_at !== note.created_at && (
                  <span className="truncate">Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
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