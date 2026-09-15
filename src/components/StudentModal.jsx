import { useState, useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'

function formatPhoneInput(val) {
  const digits = val.replace(/\D/g, '').slice(0, 9)
  let out = ''
  if (digits.length > 0) out += digits.substring(0, 2)
  if (digits.length > 2) out += ' ' + digits.substring(2, 5)
  if (digits.length > 5) out += ' ' + digits.substring(5, 7)
  if (digits.length > 7) out += ' ' + digits.substring(7, 9)
  return out
}

export default function StudentModal({ open, student, onClose, onSave }) {
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(student?.name  || '')
      setPhone(student?.phone || '')
      setError('')
      setBusy(false)
      // Telefonda keyboard ochilmasin deb avtofokus kechiktirmaymiz
      setTimeout(() => nameRef.current?.focus(), 150)
    }
  }, [open, student])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handlePhoneChange = (e) => setPhone(formatPhoneInput(e.target.value))

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Ism-familiyani kiriting'); return }
    setError('')
    setBusy(true)
    try {
      await onSave({ name: name.trim(), phone: phone.trim() })
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* 
        Telefonda pastdan chiqadi (bottom sheet),
        planshet/kompyuterda markazda modal 
      */}
      <div className="bg-white w-full sm:max-w-md
                      rounded-t-2xl sm:rounded-2xl shadow-2xl
                      animate-[slideUp_0.2s_ease-out] sm:animate-[fadeUp_0.18s_ease-out]">

        {/* Handle — faqat telefonda ko'rinadi */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
        </div>

        {/* Sarlavha */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4
                        border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            {student ? '✏️ O\'quvchini tahrirlash' : '➕ O\'quvchi qo\'shish'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100
                       p-1.5 rounded-lg transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Forma */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">

          {/* Ism */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Ism-familiya <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Masalan: Karimov Alibek"
              className={`w-full px-4 py-3 sm:py-2.5 rounded-lg border text-sm outline-none
                          transition-colors bg-white
                          ${error
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 focus:border-indigo-400'
                          }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Telefon raqami
            </label>
            <div className="flex">
              <span className="flex items-center px-3 text-sm font-semibold text-slate-500
                               bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg">
                +998
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="91 234 56 78"
                maxLength={12}
                className="flex-1 px-4 py-3 sm:py-2.5 rounded-r-lg border border-slate-200
                           focus:border-indigo-400 text-sm outline-none transition-colors
                           font-mono tracking-wide"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Raqam kiritilganda o'zi formatlanadi
            </p>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100
                        pb-safe-bottom">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:px-4 py-3 sm:py-2 text-sm font-medium
                       text-slate-600 border border-slate-200 rounded-lg
                       hover:bg-slate-50 transition-colors active:scale-95"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="flex-1 sm:flex-none sm:px-5 py-3 sm:py-2 text-sm font-semibold
                       text-white bg-indigo-600 hover:bg-indigo-700
                       disabled:opacity-60 rounded-lg transition-colors active:scale-95"
          >
            {busy ? 'Saqlanmoqda...' : student ? 'Saqlash' : 'Qo\'shish'}
          </button>
        </div>
      </div>
    </div>
  )
}
