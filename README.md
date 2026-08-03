# 🏠 Hostel Management System

A full-stack hostel management platform with an **Admin Dashboard** and a **Student Portal**.

---

## 📁 Project Structure

```
HostelProject/
├── Admin/
│   ├── backend/      → Node.js + Express + TypeScript + Prisma (SQLite)
│   └── frontend/     → React + Vite + TailwindCSS (Admin Dashboard)
├── Student/          → React + Vite + TailwindCSS (Student Portal)
├── package.json      → Root scripts (run all parts easily)
└── README.md
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or later | https://nodejs.org |
| npm | v9 or later | Comes with Node.js |

---

## 🚀 Setup Instructions

### Step 1 — Install All Dependencies

Open a terminal in `C:\Users\Deepika\HostelProject` and run:

```bash
npm run install:all
```

This installs packages for all 3 parts (backend, admin frontend, student portal).

> If you prefer to install manually, run `npm install` inside each folder:
> - `Admin/backend`
> - `Admin/frontend`
> - `Student`

---

### Step 2 — Configure the Backend Environment

The backend `.env` file is located at `Admin/backend/.env`.  
It is already configured with default values:

```env
DATABASE_URL="file:./dev.db"

EMAIL_USER=omsaipg12345@gmail.com
EMAIL_PASS=pigpcjfrjvlsbrnq
EMAIL_FROM=omsaipg12345@gmail.com
```

> ⚠️ If you want to use your own email for notifications, update `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` with your Gmail credentials and an App Password.

---

### Step 3 — Set Up the Database

The database is SQLite (`dev.db`) and is already included in the repository.  
Run the following to generate the Prisma client:

```bash
cd Admin/backend
npx prisma generate
```

If you want to reset and re-seed the database from scratch:

```bash
cd Admin/backend
npx prisma migrate reset --force
npx ts-node prisma/seed.ts
```

> The `dev.db` file already has data seeded. You can skip this step if you want to keep existing data.

---

### Step 4 — Run the Project

You need **3 terminals** running simultaneously, or use the root shortcut:

#### Option A — Run All at Once (from root folder)
```bash
npm run dev
```
This opens 3 separate command windows automatically.

#### Option B — Run Each Separately

**Terminal 1 — Backend Server:**
```bash
cd Admin/backend
npm run dev
```
Runs on → `http://localhost:3000`

**Terminal 2 — Admin Dashboard:**
```bash
cd Admin/frontend
npm run dev
```
Runs on → `http://localhost:5173`

**Terminal 3 — Student Portal:**
```bash
cd Student
npm run dev
```
Runs on → `http://localhost:5174`

---

## 🌐 App URLs (once running)

| App | URL |
|-----|-----|
| Admin Dashboard | http://localhost:5173 |
| Student Portal | http://localhost:5174 |
| Backend API | http://localhost:3000 |

---

## 🗄️ Database Info

- **Type**: SQLite (file-based, no external DB server needed)
- **Location**: `Admin/backend/prisma/dev.db`
- **ORM**: Prisma
- **Schema**: `Admin/backend/prisma/schema.prisma`

To view the database visually:
```bash
cd Admin/backend
npx prisma studio
```
Opens a browser-based DB viewer at `http://localhost:5555`

---

## 📦 Tech Stack Summary

### Backend (`Admin/backend`)
- Node.js + TypeScript
- Express.js (v5)
- Prisma ORM + SQLite
- Socket.io (real-time updates)
- Nodemailer (email notifications)

### Admin Frontend (`Admin/frontend`)
- React 19 + TypeScript
- Vite
- TailwindCSS v4
- Radix UI / shadcn components
- Zustand (state management)
- Recharts (charts/analytics)

### Student Portal (`Student`)
- React 18 + TypeScript
- Vite
- TailwindCSS v3
- React Router DOM

---

## 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies |
| `npm run backend` | Start backend server only |
| `npm run admin` | Start admin frontend only |
| `npm run student` | Start student portal only |
| `npm run dev` | Start all 3 simultaneously |
| `npx prisma studio` | Open database browser |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate reset` | Reset & re-seed database |