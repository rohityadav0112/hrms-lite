from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("/", response_model=list[schemas.AttendanceResponse])
def get_attendance(
    employee_id: Optional[str] = Query(None),
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance)
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    return query.order_by(models.Attendance.date.desc()).all()


@router.post("/", response_model=schemas.AttendanceResponse, status_code=201)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == attendance.employee_id,
            models.Attendance.date == attendance.date,
        )
        .first()
    )

    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing

    db_attendance = models.Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance
