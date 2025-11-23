# AugenAI

AugenAI is an AI-powered medical imaging analysis platform built with modern web technologies. This monorepo contains both the web application and the AI prediction service.

## 🏗️ Architecture

This project uses [Turborepo] to manage a monorepo with the following applications:

- **`apps/web`**: Next.js web application with TypeScript, Drizzle ORM, and Supabase
- **`apps/ai_service`**: FastAPI-based AI prediction service for medical image analysis

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >=18
- **pnpm** >=9.0.0
- **Python** >=3.10, <3.15
- **uv** (Python package manager)
- **Docker** (optional, for containerized deployment)
- **Supabase**

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd augenai
```

### 2. Install dependencies

Install all dependencies for both apps:

```bash
pnpm install
```

This will:

- Install Node.js dependencies for the web app
- Install Python dependencies for the AI service (runs `uv sync` automatically)

### 3. Set up environment variables

#### Web Application (`apps/web/.env`)

Create a `.env` file in `apps/web/` with the following variables:

```env
# Supabase Configuration
SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-0-us-east-0.pooler.supabase.com:6543/postgres
SUPABASE_MASTER_API_KEY=sb_secret_your_master_api_key
SUPABASE_JWT_JWK='{"x": "...", "y": "...", "alg": "ES256", "crv": "P-256", "ext": true, "kid": "...", "kty": "EC", "key_ops": ["verify"]}'

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_your_key

# AI Service
AI_PREDICTION_SERVICE_URL=http://localhost:8000/api/v1
AI_PREDICTION_SERVICE_SECRET_KEY=your_secret_key_here

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=your-project@resend.dev

# Environment
ENVIRONMENT=development
```

#### AI Service (`apps/ai_service/.env`)

Create a `.env` file in `apps/ai_service/` with:

```env
# API Configuration
AI_PREDICTION_SERVICE_SECRET_KEY=your_secret_key_here
```

**Note**: Make sure the `AI_PREDICTION_SERVICE_SECRET_KEY` matches in both `.env` files.

### 4. Database Setup

Run database migrations:

```bash
cd apps/web
pnpm migrate
cd ../..
```

### 5. Start the development servers

From the root of the monorepo:

```bash
pnpm dev
```

This will start:

- **Web App**: http://localhost:3000
- **AI Service**: http://localhost:8000

## 🧪 Testing

Run tests for all apps:

```bash
pnpm test
```

## 🏗️ Database

This project uses:

- **Drizzle ORM** for type-safe database queries
- **PostgreSQL(Supabase)** as the database
- **Supabase** for authentication and storage

### Running Migrations

```bash
cd apps/web

# Generate a new migration
pnpm generate -- <migration_name>

# Apply migrations
pnpm migrate
```

## 🐳 Docker Support

Start the entire stack with Docker Compose:

```bash
# Development
pnpm docker:dev

# Production
pnpm docker:prod
```

## 📁 Project Structure

```
augenai/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── server/           # Server-side code
│   │   │   ├── db/           # Database schemas and migrations
│   │   │   ├── services/     # Business logic
│   │   │   └── zod-schemas/  # Validation schemas
│   │   ├── tests/            # Test files
│   │   └── types/            # TypeScript type definitions
│   │
│   └── ai_service/            # FastAPI AI service
│       ├── src/              # Source code
│       └── pyproject.toml    # Python dependencies
│
├── package.json              # Root package.json
├── turbo.json               # Turborepo configuration
└── README.md                # This file
```

## 🛠️ Tech Stack

### Web Application

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI**: Radix UI, Tailwind CSS
- **Testing**: Vitest
- **Linting**: ESLint
- **Type Checking**: TypeScript

### AI Service

- **Framework**: FastAPI
- **Language**: Python 3.13
- **Package Manager**: uv
- **Linting/Formatting**: Ruff

## 🤝 Contributing

1. Create a new branch from `main`
2. Make your changes
3. Run tests and type-checking
4. Submit a pull request

### Code Quality

Before committing, ensure:

```bash
# Type-check passes
pnpm check-types

# Linting passes
pnpm lint

# Tests pass
pnpm test

# Code is formatted
pnpm format
```

## 📝 License

MIT License

## 👥 Team

Made with ❤️ by **Team Tikismikis** 🎯✨🚀

## 🐛 Issues & Support

For issues and support, please [create an issue](https://github.com/rralbertoroman/augenai/issues) on GitHub.
