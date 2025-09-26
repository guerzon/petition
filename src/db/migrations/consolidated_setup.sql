-- Philippine Petition Platform - Complete Database Schema Setup
-- This migration creates all tables for Auth.js authentication and petition platform
--
-- SETUP INSTRUCTIONS FOR NEW DEVELOPERS:
-- 1. Install dependencies: npm install
-- 2. Set up environment variables in .env:
--    - AUTH_SECRET=your-secret-key
--    - GOOGLE_CLIENT_ID=your-google-oauth-client-id
--    - GOOGLE_CLIENT_SECRET=your-google-oauth-secret
-- 3. Create D1 database: npm run db:create
-- 4. Set up all tables and seed data: npm run db:setup
-- 5. Start development server: npm run dev
--
-- OTHER USEFUL COMMANDS:
-- - Reset database: npm run db:reset
-- - View tables: wrangler d1 execute petition-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
--
-- This file creates a complete, production-ready schema with:
-- ✅ Auth.js authentication tables (users, accounts, sessions, verification_tokens)
-- ✅ Petition platform tables (petitions, signatures, categories, petition_categories)
-- ✅ Proper foreign key relationships and indexes
-- ✅ Database triggers for automatic signature counting
-- ✅ Sample Philippine-focused seed data for development

-- =============================================================================
-- AUTH.JS TABLES (for authentication)
-- =============================================================================

-- Users table (Auth.js compatible)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified DATETIME,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at number,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    oauth_token_secret TEXT,
    oauth_token TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table (for database sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires DATETIME NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- =============================================================================
-- PETITION PLATFORM TABLES
-- =============================================================================

-- Petitions table
CREATE TABLE IF NOT EXISTS petitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK(type IN ('local', 'national')) NOT NULL,
    image_url TEXT,
    target_count INTEGER DEFAULT 1000,
    current_count INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'completed', 'closed')) DEFAULT 'active',
    location TEXT, -- for local petitions (Philippine cities/provinces)
    due_date DATETIME NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published_at DATETIME,
    private BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL, -- Now references Auth.js users(id) as TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Signatures table
CREATE TABLE IF NOT EXISTS signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petition_id INTEGER NOT NULL,
    user_id TEXT NOT NULL, -- Now references Auth.js users(id) as TEXT
    comment TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(petition_id, user_id) -- Prevent duplicate signatures
);

-- Categories table for petition categorization (Philippine-focused)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Petition Categories junction table
CREATE TABLE IF NOT EXISTS petition_categories (
    petition_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (petition_id, category_id),
    FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Auth.js indexes
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Petition platform indexes
CREATE INDEX IF NOT EXISTS idx_petitions_type ON petitions(type);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_published_at ON petitions(published_at);
CREATE INDEX IF NOT EXISTS idx_petitions_private ON petitions(private);
CREATE INDEX IF NOT EXISTS idx_petitions_created_by ON petitions(created_by);
CREATE INDEX IF NOT EXISTS idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures(user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update petition signature count
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

-- Update timestamps
CREATE TRIGGER IF NOT EXISTS update_petitions_updated_at
AFTER UPDATE ON petitions
BEGIN
    UPDATE petitions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- SEED DATA - Philippine-focused content
-- =============================================================================

-- Insert Philippine-focused categories
INSERT INTO categories (name, description) VALUES
('Environment', 'Environmental protection and sustainability issues in the Philippines'),
('Education', 'Educational reforms and improvements in Philippine schools'),
('Healthcare', 'Healthcare accessibility and quality improvements'),
('Transportation', 'Public transportation and infrastructure issues'),
('Governance', 'Government transparency and accountability'),
('Social Justice', 'Human rights and social equality issues'),
('Economy', 'Economic policies and job creation'),
('Disaster Preparedness', 'Natural disaster response and preparedness'),
('Infrastructure', 'Roads, bridges, and public facilities'),
('Anti-Corruption', 'Fighting corruption in government and institutions')
ON CONFLICT(name) DO NOTHING;

-- Insert sample authenticated users (compatible with Auth.js)
-- These users simulate what would be created through OAuth authentication
INSERT INTO users (id, name, email, emailVerified, image, createdAt, updatedAt) VALUES
('user-1', 'Maria Santos', 'maria.santos@email.com', datetime('now'), 'https://images.unsplash.com/photo-1494790108755-2616b63a3c7c?w=150&h=150&fit=crop&crop=face', datetime('now'), datetime('now')),
('user-2', 'Juan Dela Cruz', 'juan.delacruz@email.com', datetime('now'), 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', datetime('now'), datetime('now')),
('user-3', 'Ana Reyes', 'ana.reyes@email.com', datetime('now'), 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', datetime('now'), datetime('now')),
('user-4', 'Jose Garcia', 'jose.garcia@email.com', datetime('now'), 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', datetime('now'), datetime('now')),
('user-5', 'Carmen Villanueva', 'carmen.villanueva@email.com', datetime('now'), 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', datetime('now'), datetime('now'))
ON CONFLICT(email) DO NOTHING;

-- Insert Philippine-focused petitions (using TEXT user IDs)
INSERT INTO petitions (
    title,
    description,
    type,
    image_url,
    target_count,
    current_count,
    status,
    location,
    due_date,
    slug,
    published_at,
    private,
    created_by
) VALUES
(
    'Save Manila Bay from Pollution',
    'Manila Bay is one of the Philippines'' most important bodies of water, but it faces severe pollution from industrial waste, sewage, and plastic debris. We call on the government to implement stricter environmental regulations and fund comprehensive cleanup programs to restore Manila Bay to its former glory.',
    'national',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
    50000,
    12847,
    'active',
    'Metro Manila',
    datetime('now', '+45 days'),
    'save-manila-bay-from-pollution',
    datetime('now', '-7 days'),
    FALSE,
    'user-1'
),
(
    'Improve Public Transportation in Cebu City',
    'Cebu City residents deserve reliable, safe, and affordable public transportation. We petition the local government to modernize the jeepney system, improve bus routes, and implement better traffic management to reduce commute times and improve air quality.',
    'local',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
    15000,
    8234,
    'active',
    'Cebu City',
    datetime('now', '+30 days'),
    'improve-public-transportation-cebu-city',
    datetime('now', '-5 days'),
    FALSE,
    'user-2'
),
(
    'Free Wi-Fi in All Public Schools Nationwide',
    'In the digital age, internet access is essential for quality education. We demand that the Department of Education provide free, reliable Wi-Fi in all public schools across the Philippines to ensure equal learning opportunities for all Filipino students.',
    'national',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    100000,
    23456,
    'active',
    'Philippines',
    datetime('now', '+60 days'),
    'free-wifi-public-schools-nationwide',
    datetime('now', '-10 days'),
    FALSE,
    'user-3'
),
(
    'Protect Palawan''s Natural Resources',
    'Palawan is home to unique biodiversity and pristine natural environments that are under threat from illegal logging, mining, and overdevelopment. We call for stronger protection of Palawan''s forests, marine sanctuaries, and wildlife habitats.',
    'local',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d5fcee?w=800&h=400&fit=crop',
    20000,
    9876,
    'active',
    'Palawan',
    datetime('now', '+75 days'),
    'protect-palawan-natural-resources',
    datetime('now', '-2 days'),
    FALSE,
    'user-4'
),
(
    'Modernize Philippine Agriculture',
    'Filipino farmers need access to modern technology, quality seeds, and fair market prices to compete globally. We petition the Department of Agriculture to implement comprehensive agricultural modernization programs and provide better support for small-scale farmers.',
    'national',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
    40000,
    18765,
    'active',
    'Philippines',
    datetime('now', '+100 days'),
    'modernize-philippine-agriculture',
    datetime('now', '-6 hours'),
    FALSE,
    'user-5'
)
ON CONFLICT(slug) DO NOTHING;

-- Link petitions to categories
INSERT INTO petition_categories (petition_id, category_id) VALUES
(1, 1), -- Manila Bay - Environment
(2, 4), -- Cebu Transport - Transportation
(3, 2), -- School Wi-Fi - Education
(4, 1), -- Palawan - Environment
(5, 7), -- Agriculture - Economy
(1, 5), -- Manila Bay also relates to Governance
(3, 7), -- School Wi-Fi also relates to Economy
(4, 9)  -- Palawan also relates to Infrastructure
ON CONFLICT(petition_id, category_id) DO NOTHING;

-- Insert sample signatures
INSERT INTO signatures (petition_id, user_id, comment, anonymous) VALUES
(1, 'user-2', 'Manila Bay ay dapat nating protektahan para sa susunod na henerasyon!', FALSE),
(1, 'user-3', 'Nakakahiya na ang estado ng Manila Bay ngayon. Kailangan natin ng aksyon!', FALSE),
(2, 'user-1', 'Traffic sa Cebu ay sobrang grabe na. Kailangan ng solusyon!', FALSE),
(3, 'user-4', 'Education is the key to progress. Support free Wi-Fi in schools!', FALSE),
(4, 'user-5', 'Palawan is a treasure that we must protect at all costs.', FALSE),
(5, 'user-1', 'Our farmers need support to feed the nation.', FALSE)
ON CONFLICT(petition_id, user_id) DO NOTHING;