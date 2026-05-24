# Walkthrough: AI ChatBoard & Analytics Dashboard
ผมได้พัฒนา Full-Stack Application เสร็จสมบูรณ์ตามความต้องการแล้วครับ ประกอบด้วยระบบ Frontend (React/Vite) และ Backend (Node.js/Express) ที่แยกส่วนกันอย่างชัดเจน พร้อมการออกแบบ UI ที่ทันสมัยแบบ Glassmorphism และฟีเจอร์ครบถ้วนครับ
- (หลังโหลด File ไปแล้ว ให้ติดตั้ง React (npm install) เพื่อที่สามารถใช้งานได้ปกติ)

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

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```
