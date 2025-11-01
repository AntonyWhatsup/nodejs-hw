import express from 'express';
import { celebrate } from 'celebrate';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
} from '../validation/notesSchemas.js';
import { authenticate } from '../middleware/authenticate.js';


const router = express.Router();


router.get('/', authenticate, getAllNotes);

router.get('/:id', authenticate, celebrate(noteIdSchema), getNoteById);

router.post('/', authenticate, celebrate(createNoteSchema), createNote);

router.patch('/:id', authenticate, celebrate(updateNoteSchema), updateNote);

router.delete('/:id', authenticate, celebrate(noteIdSchema), deleteNote);

export default router;
