-- Auth.js D1 Database Schema
-- Creates the required tables for Auth.js with D1 adapter

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionToken TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Update the existing users table to be compatible with Auth.js
-- Add Auth.js required fields to existing users table
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN image TEXT;
ALTER TABLE users ADD COLUMN emailVerified DATETIME;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
CREATE INDEX IF NOT EXISTS idx_accounts_providerAccountId ON accounts(providerAccountId);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier ON verification_tokens(identifier);

-- Create triggers to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_accounts_updated_at
AFTER UPDATE ON accounts
BEGIN
    UPDATE accounts SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at
AFTER UPDATE ON sessions
BEGIN
    UPDATE sessions SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_verification_tokens_updated_at
AFTER UPDATE ON verification_tokens
BEGIN
    UPDATE verification_tokens SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;