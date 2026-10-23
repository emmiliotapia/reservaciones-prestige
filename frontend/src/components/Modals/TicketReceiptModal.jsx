import React from 'react';
import { X, Printer, CheckCircle, Sparkles, Calendar, Users, DollarSign } from 'lucide-react';

/**
 * Vista previa y comprobante digital del ticket térmico que se imprime.
 * Diseño minimalista, elegante, moderno y profesional.
 */
export default function TicketReceiptModal({
  isOpen,
  onClose,
  ticket,
  onPrintAgain
}) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl relative font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status icon badge */}
        <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/60">
            Reservación Confirmada
          </span>
          <h3 className="font-extrabold text-base text-slate-900 mt-1">
            CASINO & LOUNGE CLUB
          </h3>
          <p className="text-xs text-indigo-600 font-semibold">
            {ticket.event_name || 'Torneo de Casino'}
          </p>
        </div>

        {/* Ticket Digital Sheet (imitando papel térmico de alta gama) */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 font-mono text-xs space-y-2.5">
          {/* Folio & Fecha del Evento */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-medium">Folio</span>
            <span className="font-extrabold text-slate-900">{ticket.ticket_id}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-medium">Fecha Evento</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {ticket.event_date || '2026-11-15'}
            </span>
          </div>

          {/* Mesa(s) destacada */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center my-2 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Mesa Asignada
            </span>
            <span className="text-lg font-black text-slate-900 tracking-tight block">
              {Array.isArray(ticket.tables) ? ticket.tables.join(' + ') : ticket.tables}
            </span>
          </div>

          {/* Titular & Comensales */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Titular</span>
            <span className="font-bold text-slate-800">{ticket.customer_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Teléfono</span>
            <span className="text-slate-700">{ticket.phone}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Comensales</span>
            <span className="font-bold text-slate-800">{ticket.party_size} Pax</span>
          </div>

          {/* Total pagado */}
          <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between">
            <span className="font-bold text-slate-700 text-xs uppercase">Total Pagado</span>
            <span className="font-black text-sm text-emerald-600">
              ${Number(ticket.total_paid || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        </div>

        {/* Footer info & reprint */}
        <div className="text-center text-[10px] text-slate-400 mb-4 font-sans">
          Presentar este comprobante al ingresar a sala.<br />
          Impresión enviada silenciosamente en 2 copias.
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrintAgain}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Reimprimir Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
