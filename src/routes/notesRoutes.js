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
  getAllNotesSchema,
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
} from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();


router.get(
  '/',
  authenticate,
  celebrate({ query: getAllNotesSchema }),
  getAllNotes
);


router.get(
  '/:noteId',
  authenticate,
  celebrate({ params: noteIdSchema }),
  getNoteById
);


router.post(
  '/',
  authenticate,
  celebrate({ body: createNoteSchema }),
  createNote
);


router.patch(
  '/:noteId',
  authenticate,
  celebrate({
    params: noteIdSchema,
    body: updateNoteSchema,
  }),
  updateNote
);


router.delete(
  '/:noteId',
  authenticate,
  celebrate({ params: noteIdSchema }),
  deleteNote
);

export default router;
