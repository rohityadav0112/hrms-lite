from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Literal, Optional


class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    department: str


class EmployeeResponse(BaseModel):
    employee_id: str
    name: str
    email: str
    department: str
    present_days: int = 0

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked: int
