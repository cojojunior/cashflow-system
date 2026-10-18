# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# cashflow-system
### 1. Open `README.md` in the root of your project and paste this:

```markdown
# SME CashFlow Manager 🇬🇭

A production-ready, mobile-first Progressive Web App (PWA) designed specifically for small and micro-business owners in Ghana. It helps business owners record daily income and expenses, understand their actual cash position, avoid cash shortages, and improve their financial literacy.

## 🌟 Key Features

- **Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS).
- **Onboarding Wizard:** Easy setup for business profiles and starting cash balances.
- **Cash Flow Dashboard:** Live KPI cards, cash flow trends, and expense breakdowns using Recharts.
- **Transaction Management:** Record Income and Expenses with categories, payment methods (Cash, MoMo, Bank), and descriptions.
- **Advanced Search & Filter:** Find specific transactions by text, type, or date range.
- **Safe Reversals:** Correct mistakes by creating opposing "Reversal" transactions without deleting financial history.
- **Account Transfers:** Move money between Cash, Mobile Money, and Bank accounts without affecting income/expense totals.
- **Cash Alerts & Planning:** Set a "Safe Cash Threshold" and plan for upcoming expenses (rent, restocking).
- **Financial Insights:** Compare month-over-month performance and view 7-day cash flow projections.
- **Financial Literacy:** Built-in micro-lessons with Ghana Cedi examples and progress tracking.
- **Reporting:** Export data to CSV or generate printable PDF reports.
- **PWA Ready:** Installable on Android and iOS devices.

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4, `@tailwindcss/vite`
- **Routing:** React Router v6
- **Database & Auth:** Supabase (PostgreSQL, RLS, Auth)
- **Forms & Validation:** React Hook Form, Zod
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest, React Testing Library
- **PWA:** `vite-plugin-pwa`

## 🚀 Local Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- A Supabase account (free tier is fine)

### 2. Clone and Install
```bash
git clone https://github.com/your-username/cashflow-system.git
cd cashflow-system
npm install
```

### 3. Supabase Setup
1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/migrations/20260101000000_initial_schema.sql` and run it.
4. Copy the contents of `supabase/seed.sql` and run it (this seeds the financial lessons).
5. Go to **Project Settings -> API** and copy your `Project URL` and `anon public` key.

### 4. Environment Variables
Create a `.env.local` file in the root of the project:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(Note: Never commit your `.env.local` file. Use `.env.example` as a template).*

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

Run the unit tests for the financial math domain:
```bash
npm run test
```

## 📦 Deployment (Netlify / Vercel)

1. Push your code to GitHub.
2. Import the repository into Netlify or Vercel.
3. Set the build command to `npm run build` and output directory to `dist`.
4. **Important:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your hosting provider's Environment Variables.
5. Go back to Supabase -> **Authentication -> URL Configuration** and update the **Site URL** to your new live domain.

## 📄 License
This project is open-source and available under the MIT License.
```

---

### 2. Create a new file `ARCHITECTURE.md` in the root of your project and paste this:

```markdown
# Architecture & System Design

This document outlines the architectural decisions, data flow, and security model of the SME CashFlow Manager.

## 1. High-Level Architecture

The application is built as a **Single Page Application (SPA)** using React and Vite. It communicates directly with a **Supabase Backend** (PostgreSQL). There is no custom API server; the frontend uses the `supabase-js` client to make secure, authenticated REST calls directly to the database.

```text
[ React / Vite Frontend ] 
       │
       ▼ (HTTPS + JWT)
[ Supabase API Gateway ]
       │
       ▼ (Row Level Security)
[ PostgreSQL Database ]
```

## 2. Directory Structure (Feature-Based)

To maintain scalability, the codebase follows a **Feature-Based Architecture** rather than a purely technical one (e.g., all components in one folder).

```text
src/
├── components/          # Global, reusable UI components (Buttons, Cards, Layouts)
├── features/            # Isolated feature modules
│   ├── accounts/        # Transfers & Accounts
│   ├── alerts/          # Cash Alerts & Planned Expenses
│   ├── auth/            # AuthProvider and context
│   ├── dashboard/       # Dashboard page and charts
│   ├── insights/        # Analytics and projections
│   ├── lessons/         # Financial literacy
│   ├── reports/         # CSV and PDF generation
│   ├── settings/        # Business profile, onboarding
│   └── transactions/    # Income/Expense logic
├── lib/                 # Initialized libraries (Supabase client, utilities)
├── domain/              # Pure business logic (financial math, tested)
├── pages/               # Global pages (Login, Register, 404, Settings)
├── services/            # Global services (Profile, Settings)
├── routes/              # React Router configuration and Guards
├── constants/           # Static data, routes, navigation links
└── types/               # TypeScript interfaces and Supabase generated types
```

## 3. Security Model (Row Level Security)

Security is the most critical aspect of this application. We do not trust the frontend. 

Every table in the database has **Row Level Security (RLS)** enabled. This means:
1. A user's JWT (JSON Web Token) is sent with every request.
2. The database checks `auth.uid()` against the `business_members` table.
3. A user can **only** SELECT, INSERT, UPDATE, or DELETE records where `business_id` matches a business they are a member of.

**Example Policy:**
```sql
CREATE POLICY "transactions select members" ON transactions
  FOR SELECT USING (is_business_member(business_id));
```

### The "Owner" Problem
When onboarding, a user creates a business. To prevent race conditions (where a user tries to read the business before the `business_members` row is created), we modified the `SELECT` policy:
```sql
CREATE POLICY "businesses select members" ON public.businesses
  FOR SELECT USING (is_business_member(id) OR owner_id = auth.uid());
```

## 4. Financial Integrity & Rules

We follow strict accounting rules to ensure the cash balance is always accurate:
1. **Balance Formula:** `Current Cash = Opening Balance + Inflows - Outflows`.
2. **Transfers:** Moving money between accounts (e.g., Cash to MoMo) does *not* count as income or expense. It is recorded in a separate `account_transfers` table and nets to zero.
3. **Reversals, not Deletions:** Users cannot hard-delete financial history. They can only "Reverse" a transaction. This creates a new, opposing transaction and sets `is_reversed = true` on the original.
4. **Immutability:** All financial mutations are logged automatically via database triggers into an `audit_logs` table.

## 5. State Management

- **Authentication State:** Handled globally via React Context (`AuthProvider`). It listens to Supabase `onAuthStateChange` and provides the `user` and `profile` objects to the app.
- **Server Data:** Fetching is handled directly inside the pages via custom service functions (e.g., `transactionService.getTransactions()`). We do not use Redux or React Query to keep the bundle size small.
- **Forms:** Handled locally via `react-hook-form` and validated with `zod`.

## 6. Offline & PWA Strategy

- The app is built with `vite-plugin-pwa`.
- It caches static assets (fonts, images, JS/CSS) via a Service Worker.
- Because financial data must always be up-to-date, database reads/writes are **not** cached offline. If the user is offline, they will see a "Network Error" state.
- An `InstallPrompt` component is shown on mobile to encourage users to add the app to their home screen.

## 7. Testability

Pure business logic (e.g., calculating balances, checking thresholds) is extracted into `src/domain/financialMath.ts`. These functions are pure (no side effects) and are unit-tested using Vitest.
```text
src/domain/financialMath.test.ts
```
```

### Push to git
```powershell
git add README.md ARCHITECTURE.md
git commit -m "docs: add detailed README and Architecture documentation"
git push origin main
```
