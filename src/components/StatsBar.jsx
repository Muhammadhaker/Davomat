const cards = [
  { key: 'total',          label: 'Jami',          icon: '👥', color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100' },
  { key: 'keldi',          label: 'Keldi',          icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'kelmadi',        label: 'Kelmadi',        icon: '❌', color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
  { key: 'sababli',        label: 'Sababli',        icon: '🟡', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  { key: 'belgilanmagan',  label: "Belgilanmagan",  icon: '⬜', color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200' },
]

export default function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 lg:gap-3">
      {cards.map(({ key, label, icon, color, bg, border }) => (
        <div
          key={key}
          className={`${bg} ${border} border rounded-xl 
                      p-2 sm:p-3 lg:p-4
                      flex flex-col items-center shadow-sm text-center`}
        >
          {/* Icon — telefonda kichik */}
          <span className="text-sm sm:text-lg lg:text-xl mb-0.5">{icon}</span>

          {/* Son */}
          <span className={`text-base sm:text-xl lg:text-2xl font-bold leading-none ${color}`}>
            {stats[key]}
          </span>

          {/* Label — telefonda 2 qatorda, kattada 1 qatorda */}
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-medium leading-tight mt-0.5 text-center">
            {/* Telefon: "Belgilanmagan" ni 2 qatorga bo'lamiz */}
            {key === 'belgilanmagan'
              ? <><span className="block sm:hidden">Belgi-</span>
                  <span className="block sm:hidden">lanmagan</span>
                  <span className="hidden sm:block">{label}</span></>
              : label
            }
          </span>
        </div>
      ))}
    </div>
  )
}
