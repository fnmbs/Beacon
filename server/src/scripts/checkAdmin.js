import dotenv from "dotenv";
dotenv.config();

import pool from "../config/db.js";

const run = async () => {
  try {
    const email = process.argv[2] || "admin@local";
    const res = await pool.query(
      "SELECT id, email, password, full_name, created_at FROM admins WHERE email = $1",
      [email],
    );
    if (res.rows.length === 0) {
      console.log(`No admin found for email: ${email}`);
    } else {
      console.log("Admin row:", res.rows[0]);
    }
  } catch (err) {
    console.error("Query error:", err.message || err);
  } finally {
    process.exit(0);
  }
};

run();
