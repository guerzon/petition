-- Fix Auth.js compatibility issues
-- Auth.js expects TEXT id (not INTEGER) and different user fields

-- First, let's recreate users table with Auth.js compatible schema
-- We need to preserve existing data while making it compatible

-- Create a new users table with Auth.js schema
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    emailVerified DATETIME,
    image TEXT,
    -- Keep our original fields for backwards compatibility
    first_name TEXT,
    last_name TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data (convert INTEGER id to TEXT)
INSERT INTO users_new (id, name, email, first_name, last_name, anonymous, created_at, updated_at)
SELECT
    CAST(id as TEXT) as id,
    (first_name || ' ' || last_name) as name,
    email,
    first_name,
    last_name,
    anonymous,
    created_at,
    updated_at
FROM users;

-- Drop the old table and rename the new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update signatures table to use TEXT user_id
-- Create new signatures table
CREATE TABLE signatures_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petition_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(petition_id, user_id)
);

-- Migrate signatures data
INSERT INTO signatures_new (id, petition_id, user_id, comment, anonymous, ip_address, created_at)
SELECT
    id,
    petition_id,
    CAST(user_id as TEXT) as user_id,
    comment,
    anonymous,
    ip_address,
    created_at
FROM signatures;

-- Drop old signatures table and rename
DROP TABLE signatures;
ALTER TABLE signatures_new RENAME TO signatures;

-- Recreate signatures indexes
CREATE INDEX IF NOT EXISTS idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures(user_id);

-- Update petitions table to use TEXT created_by
-- Create new petitions table
CREATE TABLE petitions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK(type IN ('local', 'national')) NOT NULL,
    image_url TEXT,
    target_count INTEGER DEFAULT 1000,
    current_count INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'completed', 'closed')) DEFAULT 'active',
    location TEXT,
    due_date DATETIME NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published_at DATETIME,
    private BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate petitions data
INSERT INTO petitions_new (
    id, title, description, type, image_url, target_count, current_count,
    status, location, due_date, slug, published_at, private, created_by,
    created_at, updated_at
)
SELECT
    id, title, description, type, image_url, target_count, current_count,
    status, location, due_date, slug, published_at, private,
    CAST(created_by as TEXT) as created_by,
    created_at, updated_at
FROM petitions;

-- Drop old petitions table and rename
DROP TABLE petitions;
ALTER TABLE petitions_new RENAME TO petitions;

-- Recreate petitions indexes
CREATE INDEX IF NOT EXISTS idx_petitions_type ON petitions(type);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_published_at ON petitions(published_at);
CREATE INDEX IF NOT EXISTS idx_petitions_private ON petitions(private);

-- Recreate triggers with new schema
CREATE TRIGGER IF NOT EXISTS update_petition_count_on_insert
AFTER INSERT ON signatures
BEGIN
    UPDATE petitions
    SET current_count = current_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.petition_id;
END;

CREATE TRIGGER IF NOT EXISTS update_petition_count_on_delete
AFTER DELETE ON signatures
BEGIN
    UPDATE petitions
    SET current_count = current_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.petition_id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_petitions_updated_at
AFTER UPDATE ON petitions
BEGIN
    UPDATE petitions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;