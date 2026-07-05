import dotenv from "dotenv";
dotenv.config();

import * as Admin from "../models/admin.models.js";
import pool from "../config/db.js";

const seed = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@local";
    const password = process.env.ADMIN_PASS || "admin123";
    const fullName = process.env.ADMIN_FULLNAME || "Site Admin";
    const privileges = process.env.ADMIN_PRIVS
      ? JSON.parse(process.env.ADMIN_PRIVS)
      : ["manage_users", "read", "write"];

    const existing = await Admin.findAdminByEmail(email);
    if (existing) {
      console.log(
        `Admin with email ${email} already exists (id=${existing.id}).`,
      );
      process.exit(0);
    }

    const admin = await Admin.createAdmin(
      email,
      password,
      fullName,
      privileges,
    );
    console.log("Admin seeded:", {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
    });
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err.message || err);
    process.exit(1);
  }
};

seed();
