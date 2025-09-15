import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);

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
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setLoginForm({ email: '', password: '' });
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
    setLoginForm({ email: '', password: '' });
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
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const isEdit = editingNote !== null;
      const url = isEdit ? `${API_BASE}/notes/${editingNote.id}` : `${API_BASE}/notes`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isEdit ? 'Note updated successfully!' : 'Note created successfully!');
        setNoteForm({ title: '', content: '' });
        setEditingNote(null);
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

  // Edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '' });
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
          <div className="login-container">
            <h1>SaaS Notes - Login</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="test-accounts">
              <h3>Test Accounts:</h3>
              <p><strong>Acme:</strong></p>
              <ul>
                <li>admin@acme.test (Admin)</li>
                <li>user@acme.test (Member)</li>
              </ul>
              <p><strong>Globex:</strong></p>
              <ul>
                <li>admin@globex.test (Admin)</li>
                <li>user@globex.test (Member)</li>
              </ul>
              <p><em>All passwords: "password"</em></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="user-info">
            <h1>SaaS Notes</h1>
            <div className="user-details">
              <p><strong>{user.tenant.name}</strong> ({user.tenant.subscription_plan.toUpperCase()})</p>
              <p>{user.email} - {user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Subscription Status */}
        <div className="subscription-info">
          <div className="plan-info">
            <span>Plan: {user.tenant.subscription_plan.toUpperCase()}</span>
            {user.tenant.subscription_plan === 'free' && (
              <span className="limit-info">
                ({notes.length}/3 notes used)
              </span>
            )}
          </div>
          
          {user.tenant.subscription_plan === 'free' && user.role === 'admin' && (
            <button onClick={handleUpgrade} className="btn btn-upgrade" disabled={loading}>
              {loading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>

        {/* Note Form */}
        <div className="note-form-container">
          <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
          
          {user.tenant.subscription_plan === 'free' && notes.length >= 3 && !editingNote && (
            <div className="limit-warning">
              <p>You've reached the 3-note limit for the Free plan.</p>
              {user.role === 'admin' ? (
                <button onClick={handleUpgrade} className="btn btn-upgrade">
                  Upgrade to Pro for Unlimited Notes
                </button>
              ) : (
                <p>Ask your admin to upgrade to Pro for unlimited notes.</p>
              )}
            </div>
          )}
          
          {(user.tenant.subscription_plan === 'pro' || notes.length < 3 || editingNote) && (
            <form onSubmit={handleNoteSubmit} className="note-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                  required
                  placeholder="Enter note title"
                />
              </div>
              
              <div className="form-group">
                <label>Content:</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  placeholder="Enter note content"
                  rows={4}
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : editingNote ? 'Update Note' : 'Create Note'}
                </button>
                {editingNote && (
                  <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Notes List */}
        <div className="notes-container">
          <h2>Your Notes ({notes.length})</h2>
          
          {notes.length === 0 ? (
            <p className="no-notes">No notes yet. Create your first note above!</p>
          ) : (
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="btn btn-small btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {note.content && (
                    <div className="note-content">
                      <p>{note.content}</p>
                    </div>
                  )}
                  <div className="note-meta">
                    <small>
                      Created: {new Date(note.created_at).toLocaleDateString()}
                      {note.updated_at !== note.created_at && (
                        <span> | Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
                      )}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;