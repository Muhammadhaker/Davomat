import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import StudentTable from './components/StudentTable'
import StudentModal from './components/StudentModal'
import * as api from './api/api'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function App() {
  const [students, setStudents]       = useState([])
  const [statuses, setStatuses]       = useState({})
  const [sabablar, setSabablar]       = useState({})
  const [filter, setFilter]           = useState('all')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [currentDate]                 = useState(todayStr())

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      const [studs, att] = await Promise.all([
        api.getStudents(),
        api.getAttendance(currentDate),
      ])
      setStudents(studs)
      const statusMap = {}
      const sababMap  = {}
      studs.forEach(s => { statusMap[s._id] = null; sababMap[s._id] = '' })
      if (att?.records?.length) {
        att.records.forEach(r => {
          if (r.student?._id) {
            statusMap[r.student._id] = r.status
            sababMap[r.student._id]  = r.sabab || ''
          }
        })
      }
      setStatuses(statusMap)
      setSabablar(sababMap)
    } catch (err) {
      toast.error('Server bilan ulanishda xatolik: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => { loadAll() }, [loadAll])

  const handleStatus = (studentId, status) => {
    setStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }))
    if (status !== 'sababli') {
      setSabablar(prev => ({ ...prev, [studentId]: '' }))
    }
  }

  const handleSabab = (studentId, text) => {
    setSabablar(prev => ({ ...prev, [studentId]: text }))
  }

  const handleSaveStudent = async (formData) => {
    try {
      if (editStudent) {
        const updated = await api.updateStudent(editStudent._id, formData)
        setStudents(prev => prev.map(s => s._id === updated._id ? updated : s))
        toast.success('O\'quvchi tahrirlandi')
      } else {
        const created = await api.addStudent(formData)
        setStudents(prev => [...prev, created])
        setStatuses(prev => ({ ...prev, [created._id]: null }))
        setSabablar(prev => ({ ...prev, [created._id]: '' }))
        toast.success('O\'quvchi qo\'shildi')
      }
      setModalOpen(false)
      setEditStudent(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (student) => {
    if (!window.confirm(`"${student.name}" ro'yxatdan o'chirilsinmi?`)) return
    try {
      await api.deleteStudent(student._id)
      setStudents(prev => prev.filter(s => s._id !== student._id))
      setStatuses(prev => { const n = { ...prev }; delete n[student._id]; return n })
      setSabablar(prev => { const n = { ...prev }; delete n[student._id]; return n })
      toast.success('O\'quvchi o\'chirildi')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openAdd    = () => { setEditStudent(null); setModalOpen(true) }
  const openEdit   = (s) => { setEditStudent(s);   setModalOpen(true) }
  const closeModal = () => { setModalOpen(false);  setEditStudent(null) }

  const handleSaveAll = async () => {
    const belgilanmagan = students.filter(s => !statuses[s._id])
    if (belgilanmagan.length > 0) {
      const ok = window.confirm(`${belgilanmagan.length} ta o'quvchi belgilanmagan. Baribir saqlansinmi?`)
      if (!ok) return
    }
    try {
      setSaving(true)
      const records = students.map(s => ({
        studentId: s._id,
        status:    statuses[s._id] ?? null,
        sabab:     statuses[s._id] === 'sababli' ? (sabablar[s._id] || '') : '',
      }))
      await api.saveAttendance({ date: currentDate, records })
      toast.success('Davomat saqlandi ✅')
    } catch (err) {
      toast.error('Saqlashda xatolik: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status:    statuses[s._id] ?? null,
        sabab:     statuses[s._id] === 'sababli' ? (sabablar[s._id] || '') : '',
      }))
      await api.saveAttendance({ date: currentDate, records })
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res  = await fetch(`${BASE}/attendance/export?date=${currentDate}`)
      if (!res.ok) throw new Error('Export xatoligi')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `davomat_${currentDate}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel yuklab olindi 📊')
    } catch (err) {
      toast.error('Excel xatoligi: ' + err.message)
    }
  }

  const stats = {
    total:         students.length,
    keldi:         Object.values(statuses).filter(v => v === 'keldi').length,
    kelmadi:       Object.values(statuses).filter(v => v === 'kelmadi').length,
    sababli:       Object.values(statuses).filter(v => v === 'sababli').length,
    belgilanmagan: students.filter(s => !statuses[s._id]).length,
  }

  const filtered = students.filter(s => {
    if (filter === 'all')           return true
    if (filter === 'belgilanmagan') return !statuses[s._id]
    return statuses[s._id] === filter
  })

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2500,
          style: { fontSize: '13px', maxWidth: '320px' },
        }}
      />

      <Header
        date={currentDate}
        onAdd={openAdd}
        onExport={handleExport}
        onSave={handleSaveAll}
        saving={saving}
      />

      {/* max-w-5xl — katta ekranlarda kengayadi */}
      <main className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-6 space-y-3 sm:space-y-4">
        <StatsBar stats={stats} />
        <FilterBar filter={filter} setFilter={setFilter} stats={stats} />

        <StudentTable
          students={filtered}
          statuses={statuses}
          sabablar={sabablar}
          loading={loading}
          onStatus={handleStatus}
          onSabab={handleSabab}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={openAdd}
        />

        {/* Pastki saqlash — telefonda ham qulay */}
        <div className="flex justify-end items-center gap-2 sm:gap-3 pt-1 pb-4 sm:pb-2">
          {stats.belgilanmagan > 0 && (
            <span className="text-xs sm:text-sm text-amber-600 font-medium">
              ⚠️ {stats.belgilanmagan} ta belgilanmagan
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
                       disabled:opacity-60 text-white font-semibold
                       px-4 sm:px-5 py-2.5 sm:py-2.5 text-sm
                       rounded-lg transition-colors active:scale-95"
          >
            {saving ? '⏳ Saqlanmoqda...' : '💾 Jami saqlash'}
          </button>
        </div>
      </main>

      <StudentModal
        open={modalOpen}
        student={editStudent}
        onClose={closeModal}
        onSave={handleSaveStudent}
      />
    </div>
  )
}
