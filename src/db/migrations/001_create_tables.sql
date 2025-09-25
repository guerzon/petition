-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Petitions table
CREATE TABLE IF NOT EXISTS petitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK(type IN ('local', 'national')) NOT NULL,
    image_url TEXT,
    target_count INTEGER DEFAULT 1000,
    current_count INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'completed', 'closed')) DEFAULT 'active',
    location TEXT, -- for local petitions
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Signatures table
CREATE TABLE IF NOT EXISTS signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petition_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(petition_id, user_id) -- Prevent duplicate signatures
);

-- Create Categories table for petition categorization
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Petition Categories junction table
CREATE TABLE IF NOT EXISTS petition_categories (
    petition_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (petition_id, category_id),
    FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petitions_type ON petitions(type);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to update petition signature count
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

-- Trigger to update updated_at timestamp
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