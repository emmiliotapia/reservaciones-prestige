import React, { useState } from 'react';
import { X, Calendar, User, Phone, Users, FileText, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ReservationModal({
  isOpen,
  onClose,
  selectedTables,
  onSubmit,
  isPrinting
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [timeScheduled, setTimeScheduled] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [partySize, setPartySize] = useState(
    selectedTables.reduce((acc, t) => acc + (t.capacity || 4), 0) || 4
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg('Nombre del cliente y teléfono son obligatorios');
      return;
    }
    if (selectedTables.length === 0) {
      setErrorMsg('Debe seleccionar al menos una mesa');
      return;
    }

    setErrorMsg('');
    onSubmit({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      time_scheduled: new Date(timeScheduled).toISOString(),
      party_size: Number(partySize),
      notes: notes.trim() || null,
      table_ids: selectedTables.map((t) => t.id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-mono font-bold text-lg text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
              NUEVA RESERVACIÓN POS
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Confirmación directa con doble ticket térmico silencioso
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Tables Preview */}
        <div className="my-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
              Mesas Asignadas:
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {selectedTables.map((t) => (
                <span
                  key={t.id}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30"
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400">Total Asientos</span>
            <p className="text-base font-mono font-bold text-white">
              {selectedTables.reduce((a, b) => a + b.capacity, 0)} Pax
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00FF66]" /> Nombre del Cliente
            </label>
            <input
              type="text"
              autoFocus
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: Roberto Albarrán"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00FF66]" /> Teléfono
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 664 123 4567"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00FF66]" /> Personas (Party)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00FF66]" /> Fecha y Hora
            </label>
            <input
              type="datetime-local"
              required
              value={timeScheduled}
              onChange={(e) => setTimeScheduled(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#00FF66]" /> Notas Especiales (Opcional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Aniversario, consumo VIP, botella de champagne..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPrinting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF66] text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00FF66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.4)] disabled:opacity-50"
            >
              {isPrinting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Imprimiendo...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  Confirmar e Imprimir [Enter]
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
