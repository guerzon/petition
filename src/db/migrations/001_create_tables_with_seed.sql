-- Philippine Petition Platform - Complete Database Schema and Seed Data
-- This migration creates all tables and populates them with Philippine-focused data

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

-- Create Petitions table with all required fields
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

-- Create Categories table for petition categorization (Philippine-focused)
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
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_published_at ON petitions(published_at);
CREATE INDEX IF NOT EXISTS idx_petitions_private ON petitions(private);
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

-- SEED DATA - Philippine-focused content

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
('Anti-Corruption', 'Fighting corruption in government and institutions');

-- Insert sample users (Philippine names)
INSERT INTO users (first_name, last_name, email, anonymous) VALUES
('Maria', 'Santos', 'maria.santos@email.com', FALSE),
('Juan', 'Dela Cruz', 'juan.delacruz@email.com', FALSE),
('Ana', 'Reyes', 'ana.reyes@email.com', FALSE),
('Jose', 'Garcia', 'jose.garcia@email.com', FALSE),
('Carmen', 'Villanueva', 'carmen.villanueva@email.com', FALSE),
('Miguel', 'Torres', 'miguel.torres@email.com', FALSE),
('Rosa', 'Mendoza', 'rosa.mendoza@email.com', FALSE),
('Carlos', 'Ramos', 'carlos.ramos@email.com', FALSE),
('Elena', 'Fernandez', 'elena.fernandez@email.com', FALSE),
('Roberto', 'Cruz', 'roberto.cruz@email.com', FALSE);

-- Insert Philippine-focused petitions
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
    '/images/manila-bay.jpg',
    50000,
    12847,
    'active',
    'Metro Manila',
    datetime('now', '+45 days'),
    'save-manila-bay-from-pollution-1',
    datetime('now', '-7 days'),
    FALSE,
    1
),
(
    'Improve Public Transportation in Cebu City',
    'Cebu City residents deserve reliable, safe, and affordable public transportation. We petition the local government to modernize the jeepney system, improve bus routes, and implement better traffic management to reduce commute times and improve air quality.',
    'local',
    '/images/cebu-transport.jpg',
    15000,
    8234,
    'active',
    'Cebu City',
    datetime('now', '+30 days'),
    'improve-public-transportation-cebu-city-2',
    datetime('now', '-5 days'),
    FALSE,
    2
),
(
    'Free Wi-Fi in All Public Schools Nationwide',
    'In the digital age, internet access is essential for quality education. We demand that the Department of Education provide free, reliable Wi-Fi in all public schools across the Philippines to ensure equal learning opportunities for all Filipino students.',
    'national',
    '/images/school-wifi.jpg',
    100000,
    23456,
    'active',
    'Philippines',
    datetime('now', '+60 days'),
    'free-wifi-public-schools-nationwide-3',
    datetime('now', '-10 days'),
    FALSE,
    3
),
(
    'Build More Hospitals in Mindanao',
    'Many provinces in Mindanao lack adequate healthcare facilities, forcing residents to travel long distances for medical care. We petition the Department of Health to prioritize the construction of new hospitals and health centers in underserved areas of Mindanao.',
    'national',
    '/images/mindanao-hospital.jpg',
    25000,
    5678,
    'active',
    'Mindanao',
    datetime('now', '+90 days'),
    'build-more-hospitals-mindanao-4',
    datetime('now', '-3 days'),
    FALSE,
    4
),
(
    'Protect Palawan''s Natural Resources',
    'Palawan is home to unique biodiversity and pristine natural environments that are under threat from illegal logging, mining, and overdevelopment. We call for stronger protection of Palawan''s forests, marine sanctuaries, and wildlife habitats.',
    'local',
    '/images/palawan-nature.jpg',
    20000,
    9876,
    'active',
    'Palawan',
    datetime('now', '+75 days'),
    'protect-palawan-natural-resources-5',
    datetime('now', '-2 days'),
    FALSE,
    5
),
(
    'Affordable Housing for OFW Families',
    'Overseas Filipino Workers (OFWs) contribute billions to the Philippine economy but struggle to find affordable housing when they return home. We petition the government to create special housing programs with low-interest loans for OFW families.',
    'national',
    '/images/ofw-housing.jpg',
    30000,
    14523,
    'active',
    'Philippines',
    datetime('now', '+120 days'),
    'affordable-housing-ofw-families-6',
    datetime('now', '-1 day'),
    FALSE,
    6
),
(
    'Stop Illegal Quarrying in Rizal Province',
    'Illegal quarrying operations in Rizal Province are destroying mountains, polluting rivers, and threatening local communities. We demand immediate action from local and national authorities to shut down illegal quarries and prosecute violators.',
    'local',
    '/images/rizal-quarrying.jpg',
    10000,
    3456,
    'active',
    'Rizal Province',
    datetime('now', '+40 days'),
    'stop-illegal-quarrying-rizal-province-7',
    datetime('now', '-12 hours'),
    FALSE,
    7
),
(
    'Modernize Philippine Agriculture',
    'Filipino farmers need access to modern technology, quality seeds, and fair market prices to compete globally. We petition the Department of Agriculture to implement comprehensive agricultural modernization programs and provide better support for small-scale farmers.',
    'national',
    '/images/agriculture-modern.jpg',
    40000,
    18765,
    'active',
    'Philippines',
    datetime('now', '+100 days'),
    'modernize-philippine-agriculture-8',
    datetime('now', '-6 hours'),
    FALSE,
    8
),
(
    'Improve Disaster Preparedness in Tacloban',
    'Tacloban City, having experienced the devastating effects of Typhoon Yolanda, needs better disaster preparedness infrastructure. We call for improved early warning systems, stronger evacuation centers, and comprehensive disaster response training for residents.',
    'local',
    '/images/tacloban-disaster.jpg',
    12000,
    7890,
    'active',
    'Tacloban City',
    datetime('now', '+50 days'),
    'improve-disaster-preparedness-tacloban-9',
    datetime('now', '-3 hours'),
    FALSE,
    9
),
(
    'Anti-Corruption Task Force for LGUs',
    'Corruption in Local Government Units (LGUs) undermines public trust and wastes taxpayer money. We petition the national government to establish an independent anti-corruption task force specifically focused on investigating and prosecuting corruption in local governments.',
    'national',
    '/images/anti-corruption.jpg',
    35000,
    21098,
    'active',
    'Philippines',
    datetime('now', '+80 days'),
    'anti-corruption-task-force-lgus-10',
    datetime('now', '-1 hour'),
    FALSE,
    10
);

-- Link petitions to categories
INSERT INTO petition_categories (petition_id, category_id) VALUES
(1, 1), -- Manila Bay - Environment
(2, 4), -- Cebu Transport - Transportation
(3, 2), -- School Wi-Fi - Education
(4, 3), -- Mindanao Hospitals - Healthcare
(5, 1), -- Palawan - Environment
(6, 7), -- OFW Housing - Economy
(7, 1), -- Rizal Quarrying - Environment
(8, 7), -- Agriculture - Economy
(9, 8), -- Tacloban Disaster - Disaster Preparedness
(10, 10), -- Anti-corruption - Anti-Corruption
(1, 5), -- Manila Bay also relates to Governance
(3, 7), -- School Wi-Fi also relates to Economy
(4, 9), -- Hospitals also relate to Infrastructure
(6, 6), -- OFW Housing also relates to Social Justice
(8, 9); -- Agriculture also relates to Infrastructure

-- Insert sample signatures with Filipino comments
INSERT INTO signatures (petition_id, user_id, comment, anonymous) VALUES
(1, 2, 'Manila Bay ay dapat nating protektahan para sa susunod na henerasyon!', FALSE),
(1, 3, 'Nakakahiya na ang estado ng Manila Bay ngayon. Kailangan natin ng aksyon!', FALSE),
(1, 4, 'I support this petition. Clean water is a basic right.', FALSE),
(2, 1, 'Traffic sa Cebu ay sobrang grabe na. Kailangan ng solusyon!', FALSE),
(2, 5, 'Public transport improvement is badly needed in Cebu.', FALSE),
(3, 6, 'Education is the key to progress. Support free Wi-Fi in schools!', FALSE),
(3, 7, 'Mga estudyante namin ay nangangailangan ng internet access para sa research.', FALSE),
(4, 8, 'Healthcare should be accessible to all Filipinos, especially in Mindanao.', FALSE),
(5, 9, 'Palawan is a treasure that we must protect at all costs.', FALSE),
(6, 10, 'OFWs deserve better housing options when they come home.', FALSE),
(7, 1, 'Illegal quarrying is destroying our environment. This must stop!', FALSE),
(8, 2, 'Our farmers need support to feed the nation.', FALSE),
(9, 3, 'Tacloban has learned from Yolanda. We need better preparedness.', FALSE),
(10, 4, 'Corruption is the enemy of progress. We need accountability.', FALSE);
