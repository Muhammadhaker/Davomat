import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import StudentTable from './components/StudentTable'
import StudentModal from './components/StudentModal'
import HistoryModal from './components/HistoryModal'
import * as api from './api/api'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function App() {
  const [students, setStudents]         = useState([])
  const [statuses, setStatuses]         = useState({})
  const [sabablar, setSabablar]         = useState({})
  const [filter, setFilter]             = useState('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [historyOpen, setHistoryOpen]   = useState(false)
  const [editStudent, setEditStudent]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [currentDate, setCurrentDate]   = useState(todayStr())
  const [isHistory, setIsHistory]       = useState(false)

  // ----- DATA YUKLASH -----
  const loadAll = useCallback(async (date) => {
    try {
      setLoading(true)
      const [studs, att] = await Promise.all([
        api.getStudents(),
        api.getAttendance(date),
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
  }, [])

  useEffect(() => { loadAll(currentDate) }, [loadAll, currentDate])

  // ----- TARIXDAN KUN TANLASH -----
  const handleSelectDate = (date) => {
    setCurrentDate(date)
    setIsHistory(date !== todayStr())
    setFilter('all')
  }

  // ----- BUGUNGA QAYTISH -----
  const handleBackToday = () => {
    setCurrentDate(todayStr())
    setIsHistory(false)
    setFilter('all')
  }

  // ----- STATUS O'ZGARTIRISH -----
  const handleStatus = (studentId, status) => {
    if (isHistory) return // tarixni o'zgartirish mumkin emas
    setStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }))
    if (status !== 'sababli') {
      setSabablar(prev => ({ ...prev, [studentId]: '' }))
    }
  }

  const handleSabab = (studentId, text) => {
    if (isHistory) return
    setSabablar(prev => ({ ...prev, [studentId]: text }))
  }

  // ----- O'QUVCHI QO'SHISH / TAHRIRLASH -----
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

  // ----- O'QUVCHI O'CHIRISH -----
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

  // ----- JAMI SAQLASH -----
  const handleSaveAll = async () => {
    const belgilanmagan = students.filter(s => !statuses[s._id])
    if (belgilanmagan.length > 0) {
      const ok = window.confirm(
        `${belgilanmagan.length} ta o'quvchi belgilanmagan. Baribir saqlansinmi?`
      )
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

  // ----- EXCEL EKSPORT -----
  const handleExport = async () => {
    try {
      // Avval saqlaymiz (tarix bo'lsa saqlamaymiz)
      if (!isHistory) {
        const records = students.map(s => ({
          studentId: s._id,
          status:    statuses[s._id] ?? null,
          sabab:     statuses[s._id] === 'sababli' ? (sabablar[s._id] || '') : '',
        }))
        await api.saveAttendance({ date: currentDate, records })
      }

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

  // ----- STATISTIKA -----
  const stats = {
    total:         students.length,
    keldi:         Object.values(statuses).filter(v => v === 'keldi').length,
    kelmadi:       Object.values(statuses).filter(v => v === 'kelmadi').length,
    sababli:       Object.values(statuses).filter(v => v === 'sababli').length,
    belgilanmagan: students.filter(s => !statuses[s._id]).length,
  }

  // ----- FILTR -----
  const filtered = students.filter(s => {
    if (filter === 'all')           return true
    if (filter === 'belgilanmagan') return !statuses[s._id]
    return statuses[s._id] === filter
  })

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster
        position="bottom-center"
        toastOptions={{ duration: 2500, style: { fontSize: '13px', maxWidth: '320px' } }}
      />

      <Header
        date={currentDate}
        isHistory={isHistory}
        onAdd={openAdd}
        onExport={handleExport}
        onSave={handleSaveAll}
        saving={saving}
        onHistory={() => setHistoryOpen(true)}
        onBackToday={handleBackToday}
      />

      <main className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-6 space-y-3 sm:space-y-4">

        {/* Tarix rejimi — sariq banner */}
        {isHistory && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3
                          flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">📅</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Tarix ko'rinishi</p>
                <p className="text-xs text-amber-600">
                  Bu kun davomati faqat ko'rish uchun — o'zgartirish mumkin emas
                </p>
              </div>
            </div>
            <button
              onClick={handleBackToday}
              className="shrink-0 text-xs font-semibold text-white bg-amber-500
                         hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↩ Bugunga qaytish
            </button>
          </div>
        )}

        <StatsBar stats={stats} />
        <FilterBar filter={filter} setFilter={setFilter} stats={stats} />

        <StudentTable
          students={filtered}
          statuses={statuses}
          sabablar={sabablar}
          loading={loading}
          isHistory={isHistory}
          onStatus={handleStatus}
          onSabab={handleSabab}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={openAdd}
        />

        {/* Pastki saqlash — faqat bugun */}
        {!isHistory && (
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
                         px-4 sm:px-5 py-2.5 text-sm rounded-lg transition-colors active:scale-95"
            >
              {saving ? '⏳ Saqlanmoqda...' : '💾 Jami saqlash'}
            </button>
          </div>
        )}
      </main>

      {/* Modallar */}
      <StudentModal
        open={modalOpen}
        student={editStudent}
        onClose={closeModal}
        onSave={handleSaveStudent}
      />

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectDate={handleSelectDate}
        currentDate={currentDate}
      />
    </div>
  )
}