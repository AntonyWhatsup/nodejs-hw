import express from "express";
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";

const router = express.Router();

// --- Routes ---
router.get("/notes", getAllNotes);
router.get("/notes/:noteId", getNoteById);
router.post("/notes", createNote);
router.put("/notes/:noteId", updateNote);
router.delete("/notes/:noteId", deleteNote);

export default router;
