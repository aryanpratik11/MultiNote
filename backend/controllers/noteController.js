import mongoose from 'mongoose';
import Note from '../models/Note.js';
import Tenant from '../models/Tenant.js';

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const tenant = await Tenant.findById(req.user.tenant_id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    if (tenant.subscription_plan === 'free') {
      const count = await Note.countDocuments({ tenant_id: req.user.tenant_id });
      if (count >= 3) {
        return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro for unlimited notes.' });
      }
    }

    const note = await Note.create({
      title,
      content: content || '',
      user_id: req.user.id,
      tenant_id: req.user.tenant_id
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNotes = async (req, res) => {
  const notes = await Note.find({ tenant_id: req.user.tenant_id }).sort({ updated_at: -1 });
  res.json(notes);
};

export const getNote = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, tenant_id: req.user.tenant_id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

export const updateNote = async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!noteId) return res.status(400).json({ error: 'Note ID is required' });
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  const note = await Note.findOneAndUpdate(
    { _id: noteId, tenant_id: req.user.tenant_id },
    { title, content, updated_at: Date.now() },
    { new: true }
  );

  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

export const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenant_id: req.user.tenant_id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note deleted successfully' });
};
