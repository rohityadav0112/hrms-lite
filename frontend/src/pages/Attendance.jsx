import { useState, useEffect } from 'react'
import { ClipboardCheck, CheckCircle, XCircle, CalendarDays, Filter } from 'lucide-react'
import { getEmployees, getAttendance, markAttendance } from '../api'

const today = new Date().toISOString().split('T')[0]

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)

  const [form, setForm] = useState({ employee_id: '', date: today, status: 'Present' })
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [filterEmployeeId, setFilterEmployeeId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    getEmployees()
      .then((res) => setEmployees(res.data))
      .catch(() => {})
      .finally(() => setLoadingEmployees(false))
  }, [])

  const fetchRecords = async () => {
    setLoadingRecords(true)
    try {
      const params = {}
      if (filterEmployeeId) params.employee_id = filterEmployeeId
      if (filterDate) params.date = filterDate
      const res = await getAttendance(params)
      setRecords(res.data)
    } catch {
      setRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filterEmployeeId, filterDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id) {
      setFormError('Please select an employee')
      return
    }
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      await markAttendance(form)
      setFormSuccess(`Attendance marked as ${form.status} for ${form.date}`)
      fetchRecords()
      setTimeout(() => setFormSuccess(null), 3000)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to mark attendance')
    } finally {
      setSubmitting(false)
    }
  }

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.employee_id === id)
    return emp ? emp.name : id
  }

  const presentDays = filterEmployeeId
    ? records.filter((r) => r.status === 'Present').length
    : null

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage employee attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={16} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-800">Mark Attendance</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-2 rounded-lg">
                  {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Employee</label>
                {loadingEmployees ? (
                  <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    required
                    value={form.employee_id}
                    onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  max={today}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                <div className="flex gap-3">
                  {['Present', 'Absent'].map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${
                        form.status === s
                          ? s === 'Present'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => setForm((p) => ({ ...p, status: s }))}
                        className="sr-only"
                      />
                      {s === 'Present' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : 'Mark Attendance'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-800">Attendance Records</h2>
                </div>
                {presentDays !== null && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                    {presentDays} present {presentDays === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterEmployeeId}
                      onChange={(e) => setFilterEmployeeId(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-600"
                    >
                      <option value="">All employees</option>
                      {employees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="date"
                  value={filterDate}
                  max={today}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
                />
                {(filterEmployeeId || filterDate) && (
                  <button
                    onClick={() => { setFilterEmployeeId(''); setFilterDate('') }}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {loadingRecords ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CalendarDays size={36} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-600">
                          {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getEmployeeName(record.employee_id)}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{record.employee_id}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {record.status === 'Present' ? (
                              <CheckCircle size={11} />
                            ) : (
                              <XCircle size={11} />
                            )}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
