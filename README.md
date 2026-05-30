# 🚀 Gradious Career Portal

## 📌 Project Overview

Gradious Career Portal is a **full-stack recruitment management system** designed to streamline the hiring process within an organization.
It enables **Admins, Recruiters, and Users (Job Seekers)** to interact through a structured workflow for job posting, application, and tracking.

---

## 👥 User Roles & Features

### 🔹 Admin

* Manage users and recruiters
* Invite recruiters via email (secure token-based signup)
* View and manage all jobs and applications
* Dashboard with system statistics
* Receive notifications for activities

### 🔹 Recruiter

* Signup via admin invitation
* Post and manage job openings
* View applications for their jobs
* Shortlist or reject candidates
* Dashboard with job and application insights

### 🔹 User (Job Seeker)

* Register and login
* Browse available jobs
* View job details
* Apply for jobs with resume upload
* Track application status (Pending / Shortlisted / Rejected)

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React JS

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Tools & Libraries

* JWT (Authentication)
* Multer (File Upload - Resume)
* Nodemailer (Email Invitations)
* Postman (API Testing)
* Git & GitHub (Version Control)

---

## 🔐 Key Features

* 🔑 Role-Based Authentication & Authorization (JWT)
* 📩 Recruiter Invitation System (Email-based signup)
* 📄 Resume Upload using Multer
* 🚫 Duplicate Job Application Prevention
* 📊 Dashboard Analytics (Admin & Recruiter)
* 🔔 Notification System
* 📁 Structured Backend with Controllers & Middleware

---

## 🔄 Project Flow

1. User visits portal and registers/logs in
2. Admin invites recruiters via email
3. Recruiters post jobs
4. Users browse and apply for jobs
5. Recruiters review applications and update status
6. Users track their application status
7. Admin monitors complete system

---

## 🗂️ Project Structure

```
gradious-career-portal
│
├── career-portal-backend
├── career-portal-frontend
├── career-portal-react
├── README.md
└── .gitignore
```

---

## ▶️ How to Run the Project

### Backend

```
cd career-portal-backend
npm install
npm start
```

### Frontend (React)

```
=======
# Gradious Career Portal

Monorepo for a career portal with role-based flows for **candidates**, **recruiters**, and **admins**: job listings, applications, notifications, and email (invites, password reset, application confirmations).

## Repository layout

| Path | Role |
|------|------|
| `career-portal-backend/` | Express API (MySQL), JWT auth, file uploads, mail |
| `career-portal-react/` | React (CRA) SPA used as the main modern UI |
| `career-portal-frontend/` | Legacy static frontend; the API can still serve these files from `career-portal-backend` |

## Prerequisites

- Node.js (LTS recommended)
- MySQL with a database matching your `.env` (see below)

## Backend (`career-portal-backend`)

From the backend folder:

```bash
cd career-portal-backend
npm install
npm run dev
```

The API listens on **http://localhost:5000** (see `src/index.js`). Routes are mounted under `/api/*` (for example `/api/auth`, `/api/jobs`).

### Environment variables

Create a `.env` in `career-portal-backend` (do not commit secrets). Typical keys:

| Variable | Purpose |
|----------|---------|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signing JWTs (use a strong value in production) |
| `FRONTEND_URL` | Base URL for links in emails (reset password, recruiter invite) |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP credentials for `sendMail` |
| `MAIL_FROM_DISPLAY` | Optional “from” display name |
| `SUPPORT_EMAIL` or `SUPPORT_CONTACT_EMAIL` | Shown in application confirmation emails |
| `NODE_ENV` | `production` tightens default logging (see below) |
| `LOG_LEVEL` | Optional override: `error`, `warn`, `info`, or `debug` |

## Frontend (`career-portal-react`)

From the React app folder:

```bash
>>>>>>> 793d131e9cef132f4baf8c6b4b748129b5ece636
cd career-portal-react
npm install
npm start
```

## ⚙️ Environment Setup

Create a `.env` file in backend folder and add:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=career_portal
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 💡 Challenges Faced

* Authentication and JWT handling issues
* API integration and testing errors
* Database relationships and foreign key constraints
* Duplicate data handling
* Improving UI and user experience

---

## 👩‍💻 My Contribution

I developed the complete project including:

* Frontend UI design
* Backend API development
* Database integration
* Authentication & Authorization
* Recruiter invitation system
* Job and application modules
* Resume upload functionality
* Dashboard and notification features

---

## 🔗 GitHub Repository

👉 https://github.com/swathichinnu151004-dotcom/gradious-career-portal

---

## 📌 Future Enhancements

* Deploy project (AWS / Render / Vercel)
* Add search & filter for jobs
* Improve UI with advanced React features
* Add real-time notifications
* Implement pagination

---

## ⭐ Conclusion

This project demonstrates my ability to build a **full-stack application** with real-world features like authentication, role-based access, file uploads, and email integration.

---

=======
The dev server runs on **http://localhost:3000**. API calls are configured in `src/services/api.js` (default base URL `http://localhost:5000/api`). Adjust there or via env if your API host differs.

## Logging

### API (`career-portal-backend`)

- Use `const logger = require("./utils/logger");` (path relative to each file) instead of raw `console.*`.
- Messages are prefixed with **`[gradious-api]`** and a level tag.
- **Defaults:** `NODE_ENV=production` → minimum level **info** (debug is hidden). Non-production → **debug** and above.
- Override with **`LOG_LEVEL=error|warn|info|debug`**.
- Avoid logging passwords, full tokens, or full `req.body` in production; prefer IDs and safe metadata.

### React app (`career-portal-react`)

- Use `import logger from "./utils/logger";` (adjust path from the calling file).
- Prefix **`[gradious-app]`**; in **production** builds only **warn** and **error** are printed to the browser console.

## Scripts note

`career-portal-backend/package.json` includes a `start` script that references sibling folders; for local development the usual commands are **`npm run dev`** in the backend and **`npm start`** in the React app in two terminals.
>>>>>>> 793d131e9cef132f4baf8c6b4b748129b5ece636
