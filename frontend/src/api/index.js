import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export const getEmployees = () => api.get('/api/employees')
export const createEmployee = (data) => api.post('/api/employees', data)
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`)

export const getDashboard = () => api.get('/api/dashboard')

export const getAttendance = (params) => api.get('/api/attendance', { params })
export const markAttendance = (data) => api.post('/api/attendance', data)
