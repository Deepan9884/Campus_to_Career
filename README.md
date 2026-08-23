# Campus to Career — Student Web Application

The student-facing web application for **Campus to Career AI**, built with **React 19**, **TanStack Start**, **TanStack Router**, **Tailwind CSS v4**, and **Vite**.

## Features

- 🎯 **Super Dream Preparation Module**: Comprehensive 10-section placement preparation tracking, DSA checklists, CS fundamentals quizzes, and milestones.
- 📝 **Proctored Coding Tests & Exams**: Fullscreen proctoring with webcam verification, anti-cheat detection, and multi-language live code compiler.
- 🤖 **AI Mock Interview Engine**: Speech-to-text, real-time feedback, and dynamic technical and behavioral interview simulations.
- 📄 **Resume Intelligence**: AI-powered resume parsing, scoring, ATS gap analysis, and tailored optimization recommendations.
- 🐙 **GitHub Portfolio Analyzer**: Repository code quality scoring, documentation coverage, commit cadence, and tech-stack impact metrics.
- 🏆 **Gamification & Badges**: Experience points, skill tiers, streak tracking, and unlockable achievement badges.

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api

# Mentor & Admin Portal URL (for cross-navigation)
VITE_ADMIN_APP_URL=http://localhost:8081
```

### 3. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`.

---

## Deployment to Vercel

1. Import this repository (`campus_to_career_student`) on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist/client`
5. Configure Environment Variables in the Vercel Dashboard:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com/api`)
   - `VITE_ADMIN_APP_URL`: Your deployed admin portal URL (e.g. `https://campus-to-career-admin.vercel.app`)

---

## Interconnected Services

- **Mentor & Admin Portal**: [`https://github.com/Deepan9884/campus_to_career_admin`](https://github.com/Deepan9884/campus_to_career_admin)
- **Backend API**: Express + MongoDB + Redis + Google Gemini AI

