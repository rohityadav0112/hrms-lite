from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date

from .database import engine, Base, get_db
from .models import Employee, Attendance
from .schemas import DashboardResponse
from .routers import employees, attendance

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://hrms-lite-production-bc0b.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)


@app.get("/")
def root():
    return {"message": "HRMS Lite API is running"}


@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()
    total = db.query(Employee).count()
    present = db.query(Attendance).filter(Attendance.date == today, Attendance.status == "Present").count()
    absent = db.query(Attendance).filter(Attendance.date == today, Attendance.status == "Absent").count()

    return {
        "total_employees": total,
        "present_today": present,
        "absent_today": absent,
        "not_marked": total - present - absent,
    }
