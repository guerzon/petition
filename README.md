# Petition Platform

A modern petition platform built with React, TypeScript, Vite, and Cloudflare D1. Users can create, browse, and sign petitions for local and national causes.

## ✨ Features

- 📝 **Create Petitions** - Rich markdown editor, image upload, category tagging
- 🗳️ **Sign Petitions** - Anonymous or named signatures with comments
- 🏛️ **Petition Types** - Local (with location) and National petitions
- 📊 **Progress Tracking** - Real-time signature counts and progress bars
- 🏷️ **Categories** - Environment, Education, Healthcare, Social Justice, and more
- 📱 **Responsive Design** - Works great on desktop and mobile
- 🔒 **Data Privacy** - Anonymous signing options
- 🧪 **E2E Testing** - Comprehensive Playwright test suite

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Cloudflare Workers/Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Markdown Editor**: @uiw/react-md-editor
- **Testing**: Playwright for E2E tests
- **Deployment**: Cloudflare Pages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd petition
npm install
```

### 2. Set Up Cloudflare D1 Database

#### Install Wrangler (if not already installed)

```bash
npm install -g wrangler
```

#### Login to Cloudflare

```bash
wrangler login
```

#### Create Local D1 Database

```bash
# Create and seed the database
npm run db:setup

# This will output a database ID - copy it to wrangler.toml
```

#### Or manually update wrangler.toml

Replace the `database_id` in `wrangler.toml` with your new database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "petition-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

#### Run Database Migrations

```bash
# Run initial migration (creates tables)
npm run db:migrate

# Run second migration (adds due_date and slug)
npm run db:migrate:002

# Seed with sample data
npm run db:seed
```

#### Verify Local Database Setup

```bash
# List local D1 databases
wrangler d1 list --local

# Query your local database
wrangler d1 execute petition-db --local --command "SELECT COUNT(*) FROM petitions"
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📊 Database Schema

The application uses the following main tables:

### Users
- `id` (Primary Key)
- `first_name`, `last_name`, `email`
- `anonymous` (Boolean)
- Timestamps

### Petitions
- `id` (Primary Key)
- `title`, `description`, `slug`
- `type` ('local' | 'national')
- `location` (for local petitions)
- `image_url`, `target_count`, `current_count`
- `status` ('active' | 'completed' | 'closed')
- `due_date`, `created_by`
- Timestamps

### Signatures
- `petition_id`, `user_id` (Composite key)
- `comment`, `anonymous`, `ip_address`
- Unique constraint prevents duplicate signatures

### Categories & Petition_Categories
- Category system with many-to-many relationship

## 🎯 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
npm run db:create    # Create new D1 database
npm run db:migrate   # Run initial migration
npm run db:migrate:002 # Run second migration
npm run db:seed      # Seed with sample data
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

### Testing
```bash
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:headed # Run E2E tests in headed mode
```

## 🗄️ Cloudflare D1 Local Development

### Understanding D1 Local vs Remote

- **Local**: Uses SQLite file in `.wrangler/state/d1/`
- **Remote**: Uses Cloudflare's D1 service

### Working with Local D1

```bash
# Execute SQL commands locally
wrangler d1 execute petition-db --local --command "SELECT * FROM petitions LIMIT 5"

# Execute SQL file locally
wrangler d1 execute petition-db --local --file=./custom-query.sql

# Start D1 console (interactive)
wrangler d1 execute petition-db --local

# View local D1 data location
ls -la .wrangler/state/d1/
```

### Database Management Commands

```bash
# Check table structure
wrangler d1 execute petition-db --local --command "PRAGMA table_info(petitions)"

# Count records in each table
wrangler d1 execute petition-db --local --command "
SELECT
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT
  'petitions', COUNT(*) FROM petitions
UNION ALL
SELECT
  'signatures', COUNT(*) FROM signatures
UNION ALL
SELECT
  'categories', COUNT(*) FROM categories"

# Reset database (drops all data)
wrangler d1 execute petition-db --local --command "
DROP TABLE IF EXISTS petition_categories;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS petitions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;"
```

### Backup and Restore

```bash
# Backup local database
cp .wrangler/state/d1/*.sqlite3 backup/

# Export data to SQL
wrangler d1 export petition-db --local --output backup.sql
```

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. **Create Production Database**:
   ```bash
   wrangler d1 create petition-db-prod
   ```

2. **Update wrangler.toml** with production database ID

3. **Run Production Migrations**:
   ```bash
   wrangler d1 execute petition-db-prod --file=./src/db/migrations/001_create_tables.sql
   wrangler d1 execute petition-db-prod --file=./src/db/migrations/002_add_due_date_and_slug.sql
   wrangler d1 execute petition-db-prod --file=./src/db/seeds/001_seed_data.sql
   ```

4. **Deploy**:
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

## 🧪 Testing

The project includes comprehensive E2E tests using Playwright:

### Test Coverage
- ✅ Petition browsing and listing
- ✅ Petition detail pages
- ✅ Petition creation (all form features)
- ✅ Petition signing (named, anonymous, with comments)
- ✅ Full workflow testing

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with browser UI
npm run test:e2e:ui

# Run specific test file
npx playwright test petitions.spec.ts

# Debug tests
npx playwright test --debug
```

See `tests/README.md` for detailed testing documentation.

## 🏗️ Project Structure

```
petition/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── PetitionDetail.tsx
│   │   ├── CreatePetition.tsx
│   │   └── SignPetitionModal.tsx
│   ├── db/
│   │   ├── migrations/     # Database migrations
│   │   ├── seeds/          # Seed data
│   │   └── service.ts      # Database service layer
│   ├── services/
│   │   └── api.ts          # API client
│   └── types/
│       └── api.ts          # TypeScript types
├── functions/               # Cloudflare Pages Functions
│   └── api/                # API routes
├── tests/
│   ├── e2e/                # Playwright E2E tests
│   └── README.md           # Testing documentation
├── wrangler.toml           # Cloudflare configuration
└── playwright.config.ts    # Playwright configuration
```

## 🎨 Key Components

### CreatePetition
- Card-based petition type selection
- Markdown editor for rich descriptions
- Base64 image upload
- Category dropdown with tag display
- Form validation

### PetitionDetail
- Progress tracking visualization
- Recent signatures list
- Share functionality
- Sign petition modal

### SignPetitionModal
- Form validation
- Anonymous signing option
- Comment support
- Character counting

## 🔧 Environment Variables

Create a `.dev.vars` file for local development:

```env
# Add any environment variables here
# DATABASE_URL is handled by Wrangler automatically
```

## 📝 API Routes

The application uses Cloudflare Pages Functions for API routes:

- `GET /api/petitions` - List petitions
- `GET /api/petition/[slug]` - Get petition by slug
- `POST /api/petitions` - Create petition
- `GET /api/petitions/[id]/signatures` - Get signatures
- `POST /api/signatures` - Create signature
- `GET /api/categories` - List categories
- `POST /api/users` - Create user

## 🐛 Troubleshooting

### Common Issues

**Database not found**:
```bash
# Recreate local database
wrangler d1 create petition-db --local
# Re-run migrations
npm run db:migrate && npm run db:migrate:002 && npm run db:seed
```

**Wrangler not found**:
```bash
# Install globally
npm install -g wrangler
# Or use npx
npx wrangler login
```

**Build errors**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Tests failing**:
```bash
# Install Playwright browsers
npx playwright install
# Start dev server in separate terminal
npm run dev
```

### Database Issues

**Reset local database completely**:
```bash
rm -rf .wrangler/state/d1/
npm run db:migrate && npm run db:migrate:002 && npm run db:seed
```

**Check database file location**:
```bash
ls -la .wrangler/state/d1/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Cloudflare D1](https://developers.cloudflare.com/d1/) for the database
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Testing with [Playwright](https://playwright.dev/)

---

For more detailed information about specific features, check the documentation in the relevant component files and the `tests/` directory.