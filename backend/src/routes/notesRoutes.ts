import { Router } from "express";
import { NotesController } from "../controllers/notesController";
import { authenticationToken } from "../middleware/auth";

const router = Router();

// All note routes require authentication
router.use(authenticationToken);

// Notes CRUD operations
router.get("/", NotesController.getNotes);
router.post("/", NotesController.createNote);
router.put("/:id", NotesController.updateNote);
router.delete("/:id", NotesController.deleteNote);

export default router;
