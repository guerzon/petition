-- Add due_date and slug columns to petitions table
ALTER TABLE petitions ADD COLUMN due_date DATETIME;
ALTER TABLE petitions ADD COLUMN slug TEXT;

-- Create unique index on slug for better performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);

-- Update existing petitions with due dates (60 days from creation)
UPDATE petitions 
SET due_date = datetime(created_at, '+60 days')
WHERE due_date IS NULL;

-- Generate slugs for existing petitions
UPDATE petitions 
SET slug = lower(
  replace(
    replace(
      replace(
        replace(
          replace(title, ' ', '-'), 
          '!', ''
        ), 
        '?', ''
      ), 
      '.', ''
    ), 
    ',', ''
  )
) || '-' || id
WHERE slug IS NULL;

-- Add constraint to make due_date required for new petitions
-- Note: SQLite doesn't support adding NOT NULL constraints to existing tables
-- so we'll handle this in the application code