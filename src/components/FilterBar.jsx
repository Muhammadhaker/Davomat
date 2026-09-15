const filters = [
  { value: 'all',           label: 'Barchasi',      short: 'Hammasi', icon: '🔵' },
  { value: 'keldi',         label: 'Keldi',          short: 'Keldi',   icon: '✅' },
  { value: 'kelmadi',       label: 'Kelmadi',        short: 'Kelmadi', icon: '❌' },
  { value: 'sababli',       label: 'Sababli',        short: 'Sababli', icon: '🟡' },
  { value: 'belgilanmagan', label: 'Belgilanmagan',  short: 'Belgisiz',icon: '⬜' },
]

export default function FilterBar({ filter, setFilter, stats }) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
      <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide mr-0.5">
        Filtr:
      </span>
      {filters.map(({ value, label, short, icon }) => {
        const active = filter === value
        const count  = value === 'all' ? stats.total : (stats[value] ?? 0)
        return (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1 sm:gap-1.5 
                        px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                        text-[11px] sm:text-sm font-medium border transition-all active:scale-95
                        ${active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
          >
            <span className="text-[11px] sm:text-sm">{icon}</span>
            {/* Telefonda qisqa nom */}
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className={`text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 py-0.5 font-semibold
                              ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
