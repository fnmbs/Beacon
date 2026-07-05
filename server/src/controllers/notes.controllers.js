import * as Note from "../models/notes.models.js";
import { catchAsync, AppError } from "../middleware/errorHandler.js";

export const listNotes = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const notes = await Note.getNotesByUserId(userId);
  return res.status(200).json({ success: true, data: notes });
});

export const getNote = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const note = await Note.getNoteById(id, userId);
  if (!note) throw new AppError("Note not found", 404);
  return res.status(200).json({ success: true, data: note });
});

export const createNote = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { title, content } = req.body;
  const note = await Note.createNote(userId, title || "Untitled Note", content || "");
  return res.status(201).json({ success: true, data: note });
});

export const editNote = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, content } = req.body;
  const existing = await Note.getNoteById(id, userId);
  if (!existing) throw new AppError("Note not found", 404);
  const note = await Note.updateNote(id, userId, { title, content });
  return res.status(200).json({ success: true, data: note });
});

export const removeNote = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const deleted = await Note.deleteNote(id, userId);
  if (!deleted) throw new AppError("Note not found", 404);
  return res.status(200).json({ success: true, message: "Note deleted" });
});

export const downloadNote = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const note = await Note.getNoteById(id, userId);
  if (!note) throw new AppError("Note not found", 404);
  const content = `${note.title}\n\n${note.content}`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt"`);
  return res.send(content);
});
