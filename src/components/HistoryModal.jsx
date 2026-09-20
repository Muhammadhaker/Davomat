import { useState, useEffect } from 'react'
import { FiX, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import * as api from '../api/api'

// "2025-01-15" → "15 Yanvar 2025"
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const days   = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const months = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

// Oyning barcha kunlarini qaytaradi
function getDaysInMonth(year, month) {
  const days = []
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    days.push(`${year}-${mm}-${dd}`)
  }
  return days
}

// Haftaning birinchi kuni (Dushanba = 0)
function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function HistoryModal({ open, onClose, onSelectDate, currentDate }) {
  const [history, setHistory]     = useState([]) // saqlangan sanalar
  const [loading, setLoading]     = useState(false)
  const [viewDate, setViewDate]   = useState(new Date())
  const [detail, setDetail]       = useState(null)  // tanlangan kun ma'lumoti
  const [detailLoading, setDetailLoading] = useState(false)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.getHistory()
      .then(data => setHistory(data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) { setDetail(null) }
  }, [open])

  // Saqlangan sanalarni set ga o'tkazamiz (tez qidirish uchun)
  const savedDates = new Set(history.map(h => h.date))

  // Sana statistikasi
  function getStats(dateStr) {
    const found = history.find(h => h.date === dateStr)
    if (!found) return null
    const keldi   = found.records.filter(r => r.status === 'keldi').length
    const kelmadi = found.records.filter(r => r.status === 'kelmadi').length
    const sababli = found.records.filter(r => r.status === 'sababli').length
    return { keldi, kelmadi, sababli, total: found.records.length }
  }

  // Kun tafsilotini yuklash
  async function loadDetail(dateStr) {
    if (dateStr === currentDate) {
      onSelectDate(dateStr)
      onClose()
      return
    }
    try {
      setDetailLoading(true)
      const att = await api.getAttendance(dateStr)
      setDetail({ date: dateStr, att })
    } catch {
      setDetail({ date: dateStr, att: null })
    } finally {
      setDetailLoading(false)
    }
  }

  const days    = getDaysInMonth(year, month)
  const offset  = getFirstDayOfWeek(year, month)
  const months  = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  const weekDays = ['Du','Se','Ch','Pa','Ju','Sh','Ya']

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1))
    setDetail(null)
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1))
    setDetail(null)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl
                      shadow-2xl max-h-[92vh] flex flex-col">

        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3
                        border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-indigo-500" size={17} />
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Davomat tarixi
            </h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <FiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* Oy navigatsiyasi */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-50">
            <button onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <FiChevronLeft size={18} />
            </button>
            <span className="font-semibold text-sm text-slate-700">
              {months[month]} {year}
            </span>
            <button onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <FiChevronRight size={18} />
            </button>
          </div>

          {/* Kalendar */}
          <div className="px-3 sm:px-4 py-3">
            {/* Hafta kunlari */}
            <div className="grid grid-cols-7 mb-1">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold
                                        text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>

            {/* Kunlar */}
            <div className="grid grid-cols-7 gap-1">
              {/* Bo'sh joylar */}
              {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}

              {days.map(dateStr => {
                const d       = parseInt(dateStr.split('-')[2])
                const isToday = dateStr === currentDate
                const saved   = savedDates.has(dateStr)
                const stats   = getStats(dateStr)
                const isFuture = dateStr > currentDate
                const isSelected = detail?.date === dateStr

                return (
                  <button
                    key={dateStr}
                    onClick={() => !isFuture && loadDetail(dateStr)}
                    disabled={isFuture}
                    className={`
                      relative aspect-square rounded-xl flex flex-col items-center
                      justify-center text-xs font-medium transition-all
                      ${isFuture ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                      ${isSelected ? 'ring-2 ring-indigo-400' : ''}
                      ${isToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : saved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    <span className="text-[13px] font-semibold leading-none">{d}</span>
                    {/* Statistika nuqtachalari */}
                    {saved && stats && !isToday && (
                      <div className="flex gap-0.5 mt-0.5">
                        {stats.keldi > 0 &&
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                        {stats.kelmadi > 0 &&
                          <span className="w-1 h-1 rounded-full bg-red-400" />}
                        {stats.sababli > 0 &&
                          <span className="w-1 h-1 rounded-full bg-amber-400" />}
                      </div>
                    )}
                    {isToday && (
                      <span className="text-[8px] text-indigo-200 leading-none mt-0.5">bugun</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Izoh */}
            <div className="flex items-center gap-3 mt-3 px-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />
                <span className="text-[11px] text-slate-400">Saqlangan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-indigo-600" />
                <span className="text-[11px] text-slate-400">Bugun</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] text-slate-400">Keldi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block ml-1" />
                <span className="text-[11px] text-slate-400">Kelmadi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-1" />
                <span className="text-[11px] text-slate-400">Sababli</span>
              </div>
            </div>
          </div>

          {/* Tanlangan kun tafsiloti */}
          {detailLoading && (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              Yuklanmoqda...
            </div>
          )}

          {detail && !detailLoading && (
            <div className="border-t border-slate-100 px-4 sm:px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">
                  📅 {formatDate(detail.date)}
                </h3>
                <button
                  onClick={() => { onSelectDate(detail.date); onClose() }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Bu kuni ochish →
                </button>
              </div>

              {!detail.att || !detail.att.records?.length ? (
                <p className="text-sm text-slate-400">Ma'lumot topilmadi</p>
              ) : (
                <>
                  {/* Mini statistika */}
                  {(() => {
                    const r = detail.att.records
                    const keldi   = r.filter(x => x.status === 'keldi').length
                    const kelmadi = r.filter(x => x.status === 'kelmadi').length
                    const sababli = r.filter(x => x.status === 'sababli').length
                    return (
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs bg-emerald-50 text-emerald-700
                                         border border-emerald-100 rounded-full px-2.5 py-1 font-semibold">
                          ✅ {keldi} keldi
                        </span>
                        <span className="text-xs bg-red-50 text-red-700
                                         border border-red-100 rounded-full px-2.5 py-1 font-semibold">
                          ❌ {kelmadi} kelmadi
                        </span>
                        {sababli > 0 && (
                          <span className="text-xs bg-amber-50 text-amber-700
                                           border border-amber-100 rounded-full px-2.5 py-1 font-semibold">
                            🟡 {sababli} sababli
                          </span>
                        )}
                      </div>
                    )
                  })()}

                  {/* O'quvchilar ro'yxati */}
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {detail.att.records.map((r, i) => {
                      const name = r.student?.name || 'Noma\'lum'
                      const cfg  = {
                        keldi:   { label: '✅', bg: 'bg-emerald-50 text-emerald-700' },
                        kelmadi: { label: '❌', bg: 'bg-red-50 text-red-700' },
                        sababli: { label: '🟡', bg: 'bg-amber-50 text-amber-700' },
                      }[r.status] || { label: '—', bg: 'bg-slate-50 text-slate-400' }

                      return (
                        <div key={i} className="flex items-center justify-between
                                                 text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="text-slate-700 font-medium">{name}</span>
                          <div className="flex items-center gap-1.5">
                            {r.status === 'sababli' && r.sabab && (
                              <span className="text-[10px] text-amber-600 italic max-w-[100px] truncate">
                                {r.sabab}
                              </span>
                            )}
                            <span className={`${cfg.bg} rounded-full px-2 py-0.5 font-semibold`}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-slate-600
                       border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Yopish
          </button>
        </div>
      </div>
    </div>
  )
}