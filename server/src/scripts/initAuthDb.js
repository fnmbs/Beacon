import pool from "../config/db.js";

const initAuthDb = async () => {
  try {
    // Drop existing tables if they exist (for development)
    console.log("Checking for existing auth tables...");
    await pool.query("DROP TABLE IF EXISTS email_verification_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS password_reset_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS refresh_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    console.log("✓ Old tables removed");

    // Create users table with correct schema
    const createUsersTable = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createUsersTable);
    console.log("✓ Users table created successfully");

    // Create refresh_tokens table
    const createRefreshTokensTable = `
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createRefreshTokensTable);
    console.log("✓ Refresh tokens table created successfully");

    // Create password_reset_tokens table
    const createPasswordResetTokensTable = `
      CREATE TABLE password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createPasswordResetTokensTable);
    console.log("✓ Password reset tokens table created successfully");

    // Create email_verification_tokens table
    const createEmailVerificationTokensTable = `
      CREATE TABLE email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createEmailVerificationTokensTable);
    console.log("✓ Email verification tokens table created successfully");

    // Create indexes
    await pool.query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)");
    console.log("✓ Indexes created successfully");

  } catch (error) {
    console.error("Error initializing auth database:", error);
    throw error;
  }
};

export default initAuthDb;
