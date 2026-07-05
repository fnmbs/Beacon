import pool from "../config/db.js";

const getNotesByUserId = async (userId) => {
  const res = await pool.query(
    "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC",
    [userId],
  );
  return res.rows;
};

const getNoteById = async (noteId, userId) => {
  const res = await pool.query(
    "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
    [noteId, userId],
  );
  return res.rows[0] || null;
};

const createNote = async (userId, title = "Untitled Note", content = "") => {
  const res = await pool.query(
    "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
    [userId, title, content],
  );
  return res.rows[0];
};

const updateNote = async (noteId, userId, updates) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push(`content = $${idx++}`);
    values.push(updates.content);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(noteId, userId);

  const res = await pool.query(
    `UPDATE notes SET ${fields.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values,
  );
  return res.rows[0] || null;
};

const deleteNote = async (noteId, userId) => {
  const res = await pool.query(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id",
    [noteId, userId],
  );
  return res.rowCount > 0;
};

export { getNotesByUserId, getNoteById, createNote, updateNote, deleteNote };
