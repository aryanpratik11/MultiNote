import React, { useState, useEffect } from 'react';
import './App.css'; // This can be replaced with Tailwind-only styles
// Import components
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import SubscriptionInfo from './components/SubscriptionInfo';
import NoteForm from './components/NoteForm';
import NotesList from './components/NotesList';
import NoteEdit from './components/NoteEdit';

const API_BASE = process.env.REACT_APP_API_URL || 'https://multinote-backend.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo(token);
    }
  }, []);

  // All other functions (`fetchUserInfo`, `handleLogin`, `handleLogout`, etc.) remain the same.
  // I will not repeat them here for brevity.

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        fetchNotes(token);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const handleLogin = async (loginData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        fetchNotes(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotes([]);
  };

  const fetchNotes = async (token = localStorage.getItem('token')) => {
    try {
      const response = await fetch(`${API_BASE}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleNoteSubmit = async (noteData, isEdit, editingNoteId) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = isEdit ? `${API_BASE}/notes/${editingNoteId}` : `${API_BASE}/notes`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isEdit ? 'Note updated successfully!' : 'Note created successfully!');
        fetchNotes();
      } else {
        setError(data.error || 'Failed to save note');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Note deleted successfully!');
        fetchNotes();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete note');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleUpgrade = async () => {
    if (!user || user.role !== 'admin') {
      setError('Only admins can upgrade subscriptions');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully upgraded to Pro plan!');
        fetchUserInfo(localStorage.getItem('token'));
      } else {
        setError(data.error || 'Failed to upgrade');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <LoginForm
            onLogin={handleLogin}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl">
        <Header user={user} onLogout={handleLogout} />

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}
        {success && <div className="p-4 bg-green-100 text-green-700 rounded-md mb-4">{success}</div>}

        <SubscriptionInfo
          user={user}
          notesCount={notes.length}
          onUpgrade={handleUpgrade}
          loading={loading}
        />

        <NoteForm
          onSubmit={handleNoteSubmit}
          user={user}
          notesCount={notes.length}
          loading={loading}
        />

        <NotesList
          notes={notes}
          onEditNote={(note) => setEditingNote(note)}
          onDeleteNote={handleDeleteNote}
        />

        {editingNote && (
          <NoteEdit
            initialData={editingNote}
            onSubmit={(data) => handleNoteSubmit(data, true, editingNote._id)}
            onCancel={() => setEditingNote(null)}
          />
        )}

      </div>
    </div>
  );
}

export default App;