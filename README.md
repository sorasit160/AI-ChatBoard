# AI ChatBoard & Analytics Dashboard

A modern full-stack application featuring an AI-powered chatbot, a community board, and an analytics dashboard.
Built with React, Node.js, Express, and SQLite (WebAssembly `sql.js`).

## Features

- 🤖 **Public AI Chatbot**: Powered by Google Gemini 2.0 Flash (with local mock fallback).
- 📋 **Community Board**: Authenticated users can create posts, view threads, and reply.
- 📊 **Analytics Dashboard**: Real-time KPI cards, activity timeline, and top user rankings.
- 🔐 **Authentication**: JWT-based login and registration.
- 🌐 **Internationalization**: Seamlessly switch between Thai and English.
- 🎨 **Modern UI**: Dark mode, glassmorphism design, and smooth animations.
- 🧪 **E2E Testing**: Comprehensive test suite using Playwright.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Zustand, React Router, Recharts, i18next
- **Backend**: Node.js, Express, TypeScript, sql.js (WebAssembly SQLite), jsonwebtoken
- **Testing**: Playwright

## Project Structure

```text
├── backend/                # Node.js + Express API server
│   ├── src/
│   │   ├── db/             # SQLite (sql.js) setup and wrapper
│   │   ├── routes/         # API endpoints (auth, chat, board, dashboard)
│   │   ├── middleware/     # Auth and logging
│   │   └── index.ts        # Entry point
│   └── .env                # Backend environment variables
└── frontend/               # React + Vite application
    ├── src/
    │   ├── api/            # Axios API client
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application routes
    │   ├── store/          # Zustand state management
    │   ├── i18n/           # Translation files (TH/EN)
    │   └── index.css       # Global design system
    ├── tests/              # Playwright E2E tests
    └── .env                # Frontend environment variables
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
# Add your Gemini API Key in backend/.env to use real AI (optional)
npm run dev
```

The backend server will run on `http://localhost:3001`.
A local `database.sqlite` file will be automatically created.

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173`.

### 3. Running E2E Tests

```bash
cd frontend
npx playwright install --with-deps
npx playwright test
```

To run tests with UI mode:
```bash
npx playwright test --ui
```

## Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key-here # Leave default to use mock AI
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DB_PATH=./database.sqlite
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

### Login Admin
```
Email: admin@example.com
Password: 123456
```