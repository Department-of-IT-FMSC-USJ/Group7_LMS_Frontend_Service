# Group7 LMS Frontend Service

Frontend for a role-based learning and examination platform with separate experiences for Teacher, Student, and Admin users.

This project is a static HTML/CSS/JavaScript client that communicates with a backend API (default: `http://localhost:8087/api`).

## 1. Project Overview

The application supports:

- Authentication and registration
- Teacher question-bank management and exam publishing
- Student exam attempts, timed submissions, and result review
- Teacher analytics (exam-level and student-level)
- Admin user management and system monitoring
- Shared notifications and profile management

The frontend is organized by domain folders (teacher, student, admin, analytics, notifications, profile) and a shared utility layer for API/auth/UI logic.

## 2. Tech Stack

- HTML5
- JavaScript (ES5-style with jQuery)
- TailwindCSS (via CDN)
- Font Awesome (via CDN)
- jQuery DataTables (for admin/analytics tables)
- Browser storage:
  - `localStorage` for auth/session
  - `sessionStorage` for temporary cross-page state (for example extracted PDF questions and immediate exam result payload)

## 3. High-Level Architecture

### UI Layer

- Multi-page static UI (no SPA router)
- Role-separated pages under dedicated folders

### Shared Utility Layer

- `shared/api.js`
  - API base URL
  - authenticated AJAX wrapper
  - upload helper for multipart requests
  - standardized error parser
- `shared/ui.js`
  - auth guard and role checks
  - dashboard routing by role
  - reusable header, toast, loading overlay, sub-tab switching
- `shared/helpers.js`
  - escaping/link formatting
  - date/percentage helpers
  - status badges
  - reusable question-card renderer

### Role Modules

- `teacher/`: question banks, question CRUD, exam publishing, exam detail lifecycle controls
- `student/`: exam discovery, attempt flow, timer-based submission, performance review
- `analytics/`: exam analytics and student performance breakdown
- `admin/`: user management, stats, settings
- `notifications/`: list/read/mark-all notifications
- `profile/`: profile update and password change

## 4. Folder Structure

```text
index.html                           # Login/Register entry
shared/
	api.js                             # Base API and AJAX helpers
	helpers.js                         # Common formatting/render helpers
	ui.js                              # Auth guard, headers, routing, toast/loading

teacher/
	dashboard.html/.js                 # Question sets + exams overview
	set-detail.html/.js                # Question-set detail + add/edit/delete question
	publish-exam.html/.js              # Exam creation from selected pool questions
	exam-detail.html/.js               # Exam info, publish/close, attempts list
	extract-pdf.html/.js               # Review/edit extracted PDF questions before save

student/
	dashboard.html/.js                 # Available exams, attempts, weak lessons
	take-exam.html/.js                 # Start exam, timer, answer selection, submit
	result.html/.js                    # Attempt result and answer-level feedback

analytics/
	exam-analytics.html/.js            # Distribution, pass rate, ranking table
	student-perf.html/.js              # Per-student detailed analysis

admin/
	dashboard.html/.js                 # User controls, platform stats/settings

profile/
	profile.html/.js                   # Profile and password management

notifications/
	notifications.html/.js             # Notification center
```

## 5. Authentication and Authorization

- Login and registration are handled on `index.html`.
- On successful login/register, token and identity details are stored in `localStorage`.
- Route protection is performed client-side using `requireAuth([...roles])`.
- Dashboard redirection is role-based:
  - `TEACHER` -> `teacher/dashboard.html`
  - `STUDENT` -> `student/dashboard.html`
  - `ADMIN` -> `admin/dashboard.html`

## 6. Feature Breakdown by Role

### Teacher

- Create/delete question sets (papers)
- Add/edit/delete questions in a set
- Import questions through:
  - JSON payload
  - Direct PDF import
  - PDF extract -> manual review/edit -> save
- Publish exams using full sets and/or partial question selections
- Configure exam duration, question count per student, optional schedule
- View exam details and attempts
- Publish/close exam from detail page
- Access analytics pages

### Student

- View currently available exams
- Start an exam attempt
- Answer randomized questions and submit within timer window
- Auto-submit when timer reaches zero
- Review result summary + detailed per-question feedback
- View historical attempts
- View weak-lesson and mastered-lesson indicators

### Admin

- View users with role filtering
- Activate/deactivate users
- View dynamic system statistics
- View system settings list

### Shared User Features

- Profile information update
- Password change
- Notifications inbox with mark-read and mark-all-read actions

## 7. Frontend Route Map

- Public:
  - `index.html`
- Teacher:
  - `teacher/dashboard.html`
  - `teacher/set-detail.html?id={setId}`
  - `teacher/publish-exam.html`
  - `teacher/exam-detail.html?id={examId}`
  - `teacher/extract-pdf.html`
- Student:
  - `student/dashboard.html`
  - `student/take-exam.html?id={examId}`
  - `student/result.html`
  - `student/result.html?attemptId={attemptId}`
- Admin:
  - `admin/dashboard.html`
- Analytics (teacher-only):
  - `analytics/exam-analytics.html?id={examId}`
  - `analytics/student-perf.html?examId={examId}&studentId={studentId}`
- Shared authenticated pages:
  - `profile/profile.html`
  - `notifications/notifications.html`

## 8. Backend API Endpoints Used by Frontend

### Auth

- `POST /auth/login`
- `POST /auth/register`

### Teacher

- `GET /teacher/question-sets`
- `POST /teacher/question-sets`
- `DELETE /teacher/question-sets/{id}`
- `GET /teacher/question-sets/{id}`
- `POST /teacher/question-sets/{setId}/questions`
- `PUT /teacher/questions/{id}`
- `DELETE /teacher/questions/{id}`
- `POST /teacher/question-sets/import-json`
- `POST /teacher/question-sets/import-pdf` (multipart)
- `POST /teacher/question-sets/extract-pdf` (multipart)
- `GET /teacher/exams`
- `DELETE /teacher/exams/{id}`
- `POST /teacher/exams/publish`
- `GET /teacher/exams/{id}`
- `PUT /teacher/exams/{id}/publish`
- `PUT /teacher/exams/{id}/close`
- `GET /teacher/exams/{id}/analytics`
- `GET /teacher/exams/{examId}/students/{studentId}`

### Student

- `GET /student/exams`
- `POST /student/exams/{id}/start`
- `POST /student/exams/{id}/submit`
- `GET /student/attempts`
- `GET /student/attempts/{attemptId}`
- `GET /student/weak-lessons`

### Admin

- `GET /admin/users`
- `PUT /admin/users/{id}/deactivate`
- `PUT /admin/users/{id}/activate`
- `GET /admin/stats`
- `GET /admin/settings`

### Profile

- `GET /profile`
- `PUT /profile`
- `PUT /profile/password`

### Notifications

- `GET /notifications`
- `GET /notifications/unread-count`
- `PUT /notifications/{id}/read`
- `PUT /notifications/read-all`

## 9. Local Setup and Run

Because this is a static frontend, run it using a local web server (not by opening files directly), then ensure the backend API is available.

### Prerequisites

- Backend service running and reachable at configured API base URL
- Modern browser (Chrome/Edge/Firefox)

### Configure API Base URL

Edit `shared/api.js`:

```js
var API_BASE = "http://localhost:8087/api";
```

Change this value if your backend host/port differs.

### Start Frontend (Example Options)

Use any static server. For example:

```bash
# Option 1 (Node)
npx serve .

# Option 2 (Python)
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/index.html
```

## 10. Data and State Notes

- Auth state: token, role, username in `localStorage`
- Temporary extracted PDF questions: `sessionStorage.extractedData`
- Temporary exam submit response handoff: `sessionStorage.examResult`
- Notification bell count is fetched when shared header is rendered (non-admin users)

## 11. UX and Behavior Notes

- Time-bound student exams with visible countdown and auto-submit
- Role-restricted pages with automatic redirect on unauthorized access
- Consistent loading overlays and toast feedback for async actions
- DataTables used where sortable/paginated tabular views are needed

## 12. Current Constraints and Improvement Opportunities

- API base URL is hardcoded in frontend source
- No build tooling or environment-variable injection pipeline
- Client-side access control is present, but backend authorization remains critical
- Error handling is centralized but generic; endpoint-specific guidance can be expanded
- Automated tests (unit/e2e) are not included in this repository

## 13. Suggested Next Enhancements

- Environment-based config (`dev/stage/prod`) for API base URL
- Shared constants file for endpoint paths and statuses
- Add linting/formatting and CI checks for frontend consistency
- Add automated browser tests for core flows (login, publish exam, take exam, submit)
- Improve accessibility (keyboard navigation, aria attributes, contrast checks)
