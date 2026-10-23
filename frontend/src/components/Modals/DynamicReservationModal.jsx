import React, { useState } from 'react';
import { X, Printer, User, Phone, DollarSign, Calendar, Users, AlertCircle } from 'lucide-react';

/**
 * Modal directo de reservación con cálculo por comensal:
 * - Capacidad: hasta 4 personas en mesa individual, hasta 8 en mesa doble
 * - Total a cobrar: comensales * precio_por_persona del evento
 */
export default function DynamicReservationModal({
  isOpen,
  onClose,
  selectedTable,
  allSelectedTables = [],
  eventName,
  pricePerPerson,
  onSubmit,
  isPrinting
}) {
  const isDouble = selectedTable?.group_id || allSelectedTables.length > 1;
  const maxAllowedPax = isDouble ? 8 : 4;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !selectedTable) return null;

  const totalAmount = partySize * pricePerPerson;
  const tableNames = allSelectedTables.length > 0 ? allSelectedTables.map((t) => t.id).join(' + ') : selectedTable.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg('Nombre y teléfono son obligatorios');
      return;
    }
    if (partySize > maxAllowedPax) {
      setErrorMsg(`El máximo de comensales para esta mesa es de ${maxAllowedPax} personas.`);
      return;
    }

    setErrorMsg('');
    onSubmit({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      time_scheduled: new Date().toISOString(),
      party_size: Number(partySize),
      price_per_person: pricePerPerson,
      total_paid: totalAmount,
      event_name: eventName,
      table_ids: allSelectedTables.length > 0 ? allSelectedTables.map((t) => t.dbId || t.id) : [selectedTable.dbId || selectedTable.id]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl relative font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-base text-slate-900">
                Reservar {isDouble ? 'Mesa Doble' : 'Mesa'} {tableNames}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evento: <strong className="text-indigo-600">{eventName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Pricing per person banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
              Total a Cobrar ({partySize} comensales × ${pricePerPerson})
            </span>
            <span className="text-xl font-extrabold text-indigo-950">
              ${totalAmount.toLocaleString('es-MX')} MXN
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/60 inline-block">
              Capacidad: {partySize}/{maxAllowedPax} Pax
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Titular
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej. Roberto Albarrán"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                required
                placeholder="664 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comensales (Máx. {maxAllowedPax})
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                {Array.from({ length: maxAllowedPax }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Persona' : 'Personas'} (${num * pricePerPerson} MXN)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPrinting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Imprimiendo...' : 'Confirmar & Cobrar [Enter]'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
