import { Router } from 'express';
import { createNote, getNotes, getNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { authenticateToken } from '../middleware/auth.js';

const noteRoutes = Router();

noteRoutes.post('/', authenticateToken, createNote);
noteRoutes.get('/', authenticateToken, getNotes);
noteRoutes.get('/:id', authenticateToken, getNote);
noteRoutes.put('/:id', authenticateToken, updateNote);
noteRoutes.delete('/:id', authenticateToken, deleteNote);

export default noteRoutes;
