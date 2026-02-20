# Recipe Label Maker

A mobile-first Next.js application designed to be used in a kitchen environment for creating and printing recipe labels.

This application allows users to authenticate via Google, maintain a personalized list of recipes (with temperature, time, and instructions), and print these recipes precisely formatted onto standard PLS504 label stock (3"x2" labels, 10 per Letter-sized page).

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: `better-auth` (Google OAuth)
- **PDF Generation**: `@react-pdf/renderer`
- **Animations**: `framer-motion` (Swipe-to-delete interactions)
- **Testing**: Vitest, React Testing Library, and Playwright

## 📂 Project Structure

- `src/app/` - Next.js App Router pages and API routes.
  - `src/app/actions/` - Server Actions for Recipe CRUD operations.
  - `src/app/api/auth/[...all]/` - better-auth endpoint handlers.
- `src/components/` - React components.
  - `src/components/ui/` - Shared atomic UI components (Button, Input, Toaster, SwipeableRow).
  - `src/components/pdf/` - Layout logic for `@react-pdf/renderer` to generate PLS504 templates.
- `src/db/` - Drizzle schema (`schema.ts`) and database connection initialization.
- `src/hooks/` - Custom React hooks.
- `src/lib/` - Libraries and configurations (e.g., better-auth client/server setup).
- `e2e/` - Playwright E2E browser tests.

## 🛠️ Getting Started

### 1. Requirements

Ensure you have Node.js 20+ installed.

### 2. Installation

Install the project dependencies using npm:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and populate it with the required authentication and database variables:

```env
AUTH_SECRET="generate-a-random-secure-string"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials (Required for Login)
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Local SQLite Database
DATABASE_URL="file:local.db"
```

### 4. Database Setup

Push the Drizzle schema to initialize the local SQLite database:

```bash
npm run db:push
```

### 5. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

## 🧪 Testing

The project is strictly test-driven and enforces comprehensive coverage.

### Unit & Component Testing

Uses Vitest and React Testing Library for fast component logic and server action validations.

```bash
# Run tests once
npm run test

# Run tests in UI mode
npm run test:ui
```

### End-to-End (E2E) Testing

Uses Playwright to test full browser interactions, authentication flows, and application routing.

```bash
# Run all E2E specifications
npm run test:e2e
```

_Note: Due to Vitest configuration, E2E tests are correctly isolated and excluded from running during standard unit test execution to prevent test runner collisions._

## 📖 Key Architectural Decisions

- **Instructions Limit**: The instructions field is strictly limited to 200 characters to physically fit onto the 3"x2" PLS504 label dimensions without text overflow.
- **Undo History**: Deletions and edits emit a full JSON snapshot into a `recipeHistory` table. This drives the "Undo" toast notifications, allowing robust, state-perfect rollbacks without relying solely on client-side memory.
- **Swipe-to-Delete**: Mobile UX relies primarily on swipe gestures constructed manually using `framer-motion` to reveal destructive actions.
