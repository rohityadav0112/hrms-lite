from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("/", response_model=list[schemas.EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    present_subq = (
        db.query(
            models.Attendance.employee_id,
            func.count(models.Attendance.id).label("present_days"),
        )
        .filter(models.Attendance.status == "Present")
        .group_by(models.Attendance.employee_id)
        .subquery()
    )

    results = (
        db.query(models.Employee, present_subq.c.present_days)
        .outerjoin(present_subq, models.Employee.employee_id == present_subq.c.employee_id)
        .all()
    )

    return [
        {
            "employee_id": emp.employee_id,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department,
            "present_days": days or 0,
        }
        for emp, days in results
    ]


@router.post("/", response_model=schemas.EmployeeResponse, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if not employee.employee_id.strip() or not employee.name.strip() or not employee.department.strip():
        raise HTTPException(status_code=422, detail="All fields are required")

    if db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    if db.query(models.Employee).filter(models.Employee.email == employee.email).first():
        raise HTTPException(status_code=400, detail="Email address already registered")

    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return {
        "employee_id": db_employee.employee_id,
        "name": db_employee.name,
        "email": db_employee.email,
        "department": db_employee.department,
        "present_days": 0,
    }


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
