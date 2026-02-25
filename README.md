# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance tracking.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | FastAPI (Python)                    |
| Database   | SQLite (dev) / PostgreSQL (prod)    |
| Deployment | Vercel (frontend), Render (backend) |

## Features

- **Employee Management** — Add, view, and delete employee records with duplicate validation
- **Attendance Tracking** — Mark daily attendance (Present / Absent) with upsert logic
- **Dashboard** — Live stats for total employees, present/absent today, and unmarked count
- **Bonus** — Filter attendance by employee and date; total present days per employee

---

## Running Locally

### 1. Clone the repository

```bash
git clone <repo-url>
cd hrms-lite
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env            # set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint                     | Description                     |
|--------|------------------------------|---------------------------------|
| GET    | `/api/employees`             | List all employees              |
| POST   | `/api/employees`             | Create a new employee           |
| DELETE | `/api/employees/{id}`        | Delete an employee              |
| GET    | `/api/attendance`            | List records (filterable)       |
| POST   | `/api/attendance`            | Mark / update attendance        |
| GET    | `/api/dashboard`             | Get today's summary stats       |

---

## Deployment

### Backend on Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable `DATABASE_URL` pointing to a Render PostgreSQL instance

### Frontend on Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable `VITE_API_URL` pointing to your Render backend URL
4. Deploy

---

## Assumptions & Limitations

- Single admin user — no authentication is implemented
- SQLite is used locally; switch to PostgreSQL by setting the `DATABASE_URL` environment variable
- Deleting an employee also removes all their attendance records (cascade delete)
- Attendance for the same employee and date is updated in-place (upsert)
- Leave management, payroll, and other advanced HR features are out of scope
