import { FiUserPlus, FiDownload, FiSave } from 'react-icons/fi'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const days   = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function Header({ date, onAdd, onExport, onSave, saving }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 lg:px-6 h-13 sm:h-14 flex items-center justify-between gap-2">

        {/* CHAP: logo + sana */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600 tracking-tight whitespace-nowrap">
            📋 Davomat
          </span>
          {/* Sana — telefonda yashiriladi, planshetten ko'rinadi */}
          <span className="hidden md:block text-xs bg-slate-100 text-slate-500
                           border border-slate-200 rounded-full px-3 py-1 whitespace-nowrap">
            {formatDate(date)}
          </span>
        </div>

        {/* O'NG: tugmalar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Excel — telefonda faqat icon */}
          <button
            onClick={onExport}
            title="Excel yuklab olish"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium
                       text-slate-600 hover:text-emerald-700 hover:bg-emerald-50
                       border border-slate-200 hover:border-emerald-300
                       px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all active:scale-95"
          >
            <FiDownload size={15} />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Saqlash — telefonda faqat icon */}
          <button
            onClick={onSave}
            disabled={saving}
            title="Saqlash"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium
                       text-slate-600 hover:text-indigo-700 hover:bg-indigo-50
                       border border-slate-200 hover:border-indigo-300
                       px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all
                       disabled:opacity-50 active:scale-95"
          >
            <FiSave size={15} />
            <span className="hidden sm:inline">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
          </button>

          {/* Qo'shish — har doim matn ko'rinadi, telefonda qisqa */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold
                       text-white bg-indigo-600 hover:bg-indigo-700
                       px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg
                       transition-colors active:scale-95 whitespace-nowrap"
          >
            <FiUserPlus size={14} />
            <span className="hidden xs:inline sm:inline">Qo'shish</span>
            <span className="xs:hidden sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Telefonda sana pastda ko'rinadi */}
      <div className="md:hidden border-t border-slate-100 px-3 py-1.5 text-center">
        <span className="text-[11px] text-slate-400">{formatDate(date)}</span>
      </div>
    </header>
  )
}
