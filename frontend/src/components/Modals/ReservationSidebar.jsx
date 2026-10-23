import React, { useState } from 'react';
import { X, Printer, User, Phone, DollarSign, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Panel Lateral Derecho para Captura de Reservación en Mesas Disponibles
 * Permite mantener todo el plano de sala visible mientras se llenan los datos.
 */
export default function ReservationSidebar({
  isOpen,
  onClose,
  selectedTable,
  allSelectedTables = [],
  eventName,
  eventDate,
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
      event_date: eventDate,
      table_ids: allSelectedTables.length > 0 ? allSelectedTables.map((t) => t.dbId || t.id) : [selectedTable.dbId || selectedTable.id]
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200/90 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-extrabold text-base text-slate-800">
              {isDouble ? 'Mesa Doble' : 'Mesa'} {tableNames}
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">
            Disponible para Reserva
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Event banner context */}
      <div className="px-5 py-3 bg-indigo-50/50 border-b border-indigo-100/60 flex items-center justify-between text-xs font-medium text-slate-600">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Evento Activo</span>
          <span className="font-bold text-indigo-950 truncate max-w-[200px] block">{eventName}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Fecha</span>
          <span className="font-bold text-slate-700">{eventDate}</span>
        </div>
      </div>

      {/* Body with form */}
      <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          {/* Dynamic Pricing card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
              Total a Cobrar ({partySize} Pax × ${pricePerPerson} MXN)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${totalAmount.toLocaleString('es-MX')} MXN
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                100% Cubierto
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form fields */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Número de Comensales
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Máx. {maxAllowedPax} personas
              </span>
            </div>
            <select
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
            >
              {Array.from({ length: maxAllowedPax }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Comensal' : 'Comensales'} (${num * pricePerPerson} MXN)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Submit Button & Quitar Mesa */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button
            type="submit"
            disabled={isPrinting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Imprimiendo...' : 'Confirmar & Cobrar [Enter]'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-center"
            >
              Cancelar
            </button>

            {selectedTable?.onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Quitar mesa ${selectedTable.id} de la sala?`)) {
                    selectedTable.onDelete(selectedTable.id);
                    onClose();
                  }
                }}
                className="py-2 px-3 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Eliminar mesa de la sala"
              >
                Quitar Mesa
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
