import express from "express";
import {
  listNotes,
  getNote,
  createNote,
  editNote,
  removeNote,
  downloadNote,
} from "../controllers/notes.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listNotes);
router.get("/:id", getNote);
router.get("/:id/download", downloadNote);
router.post("/", createNote);
router.patch("/:id", editNote);
router.delete("/:id", removeNote);

export default router;
