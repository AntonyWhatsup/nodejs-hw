import { Router } from 'express';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema
} from '../validations/notesValidation.js';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController.js';

const router = Router();

router.get('/notes', getAllNotesSchema, getAllNotes);
router.get('/notes/:noteId', noteIdSchema, getNoteById);
router.post('/notes', createNoteSchema, createNote);
router.patch('/notes/:noteId', updateNoteSchema, updateNote);
router.delete('/notes/:noteId', noteIdSchema, deleteNote);

export default router;
