import { useEffect, useState } from 'react'
import { Users, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { getDashboard, getEmployees } from '../api'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboard(), getEmployees()])
      .then(([dashRes, empRes]) => {
        setStats(dashRes.data)
        setEmployees(empRes.data.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Employees"
              value={stats?.total_employees ?? 0}
              color="bg-indigo-500"
            />
            <StatCard
              icon={CheckCircle}
              label="Present Today"
              value={stats?.present_today ?? 0}
              color="bg-emerald-500"
            />
            <StatCard
              icon={XCircle}
              label="Absent Today"
              value={stats?.absent_today ?? 0}
              color="bg-red-400"
            />
            <StatCard
              icon={Clock}
              label="Not Marked"
              value={stats?.not_marked ?? 0}
              color="bg-amber-400"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Recent Employees</h2>
            </div>

            {employees.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={36} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No employees added yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-mono text-indigo-600 font-medium">
                        {emp.employee_id}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                      <td className="px-5 py-3 text-sm">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{emp.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
