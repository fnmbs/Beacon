import pool from "../config/db.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const createUser = async function (email, password, fullName) {
  const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role, is_email_verified",
    [email, hashedPassword, fullName],
  );

  return result.rows[0];
};

const findUserByEmail = async function (email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
};

const findUserById = async function (id) {
  const result = await pool.query(
    "SELECT id, email, full_name, role, is_email_verified, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
};

const updatePassword = async function (userId, newPassword) {
  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  const result = await pool.query(
    "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name",
    [hashedPassword, userId],
  );
  return result.rows[0] || null;
};

const verifyEmail = async function (userId) {
  const result = await pool.query(
    "UPDATE users SET is_email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, full_name, is_email_verified",
    [userId],
  );
  return result.rows[0] || null;
};

const updateRole = async function (userId, newRole) {
  const result = await pool.query(
    "UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, role",
    [newRole, userId],
  );
  return result.rows[0] || null;
};

const verifyPassword = async function (plainPassword, hashedPassword) {
  return await bcryptjs.compare(plainPassword, hashedPassword);
};

const generateToken = function (userId, email, role) {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || "your-secret-key-change-this",
    { expiresIn: "7d" },
  );
};

const verifyToken = function (token) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key-change-this",
  );
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  updatePassword,
  verifyEmail,
  updateRole,
  verifyPassword,
  generateToken,
  verifyToken,
};
