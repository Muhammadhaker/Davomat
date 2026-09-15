import { FiEdit2, FiTrash2 } from 'react-icons/fi'

function formatPhone(phone) {
  if (!phone) return '—'
  const d = phone.replace(/\D/g, '')
  let out = ''
  if (d.length > 0) out += d.substring(0, 2)
  if (d.length > 2) out += ' ' + d.substring(2, 5)
  if (d.length > 5) out += ' ' + d.substring(5, 7)
  if (d.length > 7) out += ' ' + d.substring(7, 9)
  return '+998 ' + out
}

function StatusToggle({ studentId, current, sabab, onStatus, onSabab }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 sm:gap-1.5">

        {/* KELDI */}
        <button
          onClick={() => onStatus(studentId, 'keldi')}
          className={`flex-1 text-[11px] sm:text-xs 
                      py-2 sm:py-1.5 px-1 sm:px-2 rounded-md border font-medium 
                      transition-all active:scale-95 touch-manipulation
                      ${current === 'keldi'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-400 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
        >
          ✓ Keldi
        </button>

        {/* KELMADI */}
        <button
          onClick={() => onStatus(studentId, 'kelmadi')}
          className={`flex-1 text-[11px] sm:text-xs
                      py-2 sm:py-1.5 px-1 sm:px-2 rounded-md border font-medium
                      transition-all active:scale-95 touch-manipulation
                      ${current === 'kelmadi'
                        ? 'bg-red-100 text-red-700 border-red-400 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-600'
                      }`}
        >
          ✗ Kelmadi
        </button>

        {/* SABABLI */}
        <button
          onClick={() => onStatus(studentId, 'sababli')}
          className={`flex-1 text-[11px] sm:text-xs
                      py-2 sm:py-1.5 px-1 sm:px-2 rounded-md border font-medium
                      transition-all active:scale-95 touch-manipulation
                      ${current === 'sababli'
                        ? 'bg-amber-100 text-amber-700 border-amber-400 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                      }`}
        >
          ~ Sababli
        </button>
      </div>

      {/* Sabab input */}
      {current === 'sababli' && (
        <input
          type="text"
          value={sabab || ''}
          onChange={(e) => onSabab(studentId, e.target.value)}
          placeholder="Sabab yozing (kasallik, ruxsat...)"
          className="w-full text-xs px-2.5 py-2 sm:py-1.5 border border-amber-300 rounded-md
                     bg-amber-50 text-amber-800 placeholder-amber-400
                     focus:outline-none focus:border-amber-500 transition-colors"
          autoFocus
        />
      )}
    </div>
  )
}

export default function StudentTable({
  students, statuses, sabablar, loading,
  onStatus, onSabab, onEdit, onDelete, onAdd
}) {

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 sm:p-16 text-center">
        <div className="text-3xl sm:text-4xl mb-3 animate-pulse">⏳</div>
        <p className="text-slate-400 text-sm">Ma'lumotlar yuklanmoqda...</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 sm:p-16 text-center">
        <div className="text-4xl sm:text-5xl mb-3">📝</div>
        <p className="text-slate-500 font-medium text-sm sm:text-base">O'quvchilar yo'q</p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Filtr bo'yicha natija topilmadi yoki hali o'quvchi qo'shilmagan
        </p>
        <button
          onClick={onAdd}
          className="mt-4 text-sm text-indigo-600 hover:underline font-medium"
        >
          + O'quvchi qo'shish
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Jadval boshi */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3
                      border-b border-slate-100 bg-slate-50">
        <span className="text-xs sm:text-sm font-semibold text-slate-600">
          O'quvchilar ro'yxati
        </span>
        <span className="text-[11px] sm:text-xs text-slate-400">
          {students.length} ta
        </span>
      </div>

      {/* ===================== */}
      {/* TELEFON (< 640px) — karta ko'rinishi */}
      {/* ===================== */}
      <div className="sm:hidden divide-y divide-slate-100">
        {students.map((s, idx) => (
          <div key={s._id} className="p-3">
            {/* Ism + tugmalar */}
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 text-sm leading-tight truncate">
                    {s.name}
                  </span>
                </div>
                {s.phone && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 ml-4">
                    {formatPhone(s.phone)}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0 mt-0.5">
                <button
                  onClick={() => onEdit(s)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600
                             hover:bg-indigo-50 active:scale-95 transition-all touch-manipulation"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(s)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600
                             hover:bg-red-50 active:scale-95 transition-all touch-manipulation"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            {/* Status tugmalari */}
            <StatusToggle
              studentId={s._id}
              current={statuses[s._id]}
              sabab={sabablar[s._id]}
              onStatus={onStatus}
              onSabab={onSabab}
            />
          </div>
        ))}
      </div>

      {/* ===================== */}
      {/* PLANSHET (640–1024px) — kompakt jadval */}
      {/* ===================== */}
      <div className="hidden sm:block lg:hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2 w-8">#</th>
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2">Ism-familiya</th>
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2 w-36">Davomat</th>
              <th className="w-16 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-3 py-2.5 text-xs text-slate-400 font-medium">{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{s.name}</p>
                  {s.phone && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatPhone(s.phone)}</p>
                  )}
                </td>
                <td className="px-3 py-2.5 min-w-[200px]">
                  <StatusToggle
                    studentId={s._id}
                    current={statuses[s._id]}
                    sabab={sabablar[s._id]}
                    onStatus={onStatus}
                    onSabab={onSabab}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-0.5">
                    <button
                      onClick={() => onEdit(s)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600
                                 hover:bg-indigo-50 transition-colors"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600
                                 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===================== */}
      {/* KOMPUTER / NOTEBOOK (1024px+) — to'liq jadval */}
      {/* ===================== */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-12">#</th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Ism-familiya</th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Tel raqam</th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-72">Davomat</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-400 font-medium">{idx + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm">{s.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500 font-mono">{formatPhone(s.phone)}</td>
                <td className="px-4 py-3">
                  <StatusToggle
                    studentId={s._id}
                    current={statuses[s._id]}
                    sabab={sabablar[s._id]}
                    onStatus={onStatus}
                    onSabab={onSabab}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(s)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600
                                 hover:bg-indigo-50 transition-colors"
                      title="Tahrirlash"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600
                                 hover:bg-red-50 transition-colors"
                      title="O'chirish"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
