import pool from "../config/db.js";

const initAuthDb = async () => {
  try {
    console.log("Initializing auth tables...");
    await pool.query("DROP TABLE IF EXISTS email_verification_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS password_reset_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS refresh_tokens CASCADE");
    console.log("✓ Old auth token tables removed");

    // Add auth columns to users table (created by initDb.js with UUID PK)
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log("✓ Users table augmented with auth columns");

    // Create refresh_tokens table (UUID user_id references)
    const createRefreshTokensTable = `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createRefreshTokensTable);
    console.log("✓ Refresh tokens table created successfully");

    // Create password_reset_tokens table
    const createPasswordResetTokensTable = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createPasswordResetTokensTable);
    console.log("✓ Password reset tokens table created successfully");

    // Create email_verification_tokens table
    const createEmailVerificationTokensTable = `
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        type VARCHAR(50) DEFAULT 'verify',
        pending_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createEmailVerificationTokensTable);
    console.log("✓ Email verification tokens table created successfully");

    // Create indexes
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
