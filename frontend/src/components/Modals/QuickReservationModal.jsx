import React, { useState } from 'react';
import { X, Printer, User, Phone, DollarSign, Calendar, Users, Sparkles } from 'lucide-react';

/**
 * Modal directo de reservación para mesa disponible
 * - Pre-llena el precio base del evento
 * - Asume pago completo (sin pagos parciales)
 * - Confirmar cambia estado a ocupada, guarda y dispara doble ticket térmico silencioso
 */
export default function QuickReservationModal({
  isOpen,
  onClose,
  selectedTable,
  allSelectedTables = [],
  eventName,
  eventPrice,
  onSubmit,
  isPrinting
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(
    allSelectedTables.length > 1 ? allSelectedTables.length * 4 : 4
  );

  if (!isOpen || !selectedTable) return null;

  const totalAmount = eventPrice * (allSelectedTables.length > 0 ? allSelectedTables.length : 1);
  const tableNames = allSelectedTables.length > 0 ? allSelectedTables.map((t) => t.id).join(', ') : selectedTable.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) return;

    onSubmit({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      time_scheduled: new Date().toISOString(),
      party_size: Number(partySize),
      total_paid: totalAmount,
      event_name: eventName,
      table_ids: allSelectedTables.length > 0 ? allSelectedTables.map((t) => t.dbId || t.id) : [selectedTable.dbId || selectedTable.id]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-xl relative font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-base text-slate-800">
                Reservar Mesa {tableNames}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evento: <strong className="text-slate-700">{eventName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing badge */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              $
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight block">
                Total a Cobrar (Pago Completo)
              </span>
              <span className="text-lg font-bold text-slate-900">
                ${totalAmount.toFixed(2)} MXN
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            100% Cubierto
          </span>
        </div>

        {/* Formulario directo */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej. Roberto Albarrán"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                required
                placeholder="664 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Comensales (Pax)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
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
