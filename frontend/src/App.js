import React, { useState, useEffect } from 'react';
import './App.css';

// Import components
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import SubscriptionInfo from './components/SubscriptionInfo';
import NoteForm from './components/NoteForm';
import NotesList from './components/NotesList';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo(token);
    }
  }, []);

  // Fetch user info
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

  // Login
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotes([]);
  };

  // Fetch notes
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

  // Create or update note
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

  // Delete note
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

  // Upgrade subscription
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
        // Refresh user info
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

  // Clear messages
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
      <div className="app">
        <div className="container">
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
    <div className="app">
      <div className="container">
        <Header user={user} onLogout={handleLogout} />
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
          onEditNote={handleNoteSubmit}
          onDeleteNote={handleDeleteNote}
        />
      </div>
    </div>
  );
}

export default App;