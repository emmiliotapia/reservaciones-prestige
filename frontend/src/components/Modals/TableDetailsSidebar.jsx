import React from 'react';
import { X, CheckCircle, User, Phone, DollarSign, Calendar, Users, Trash2 } from 'lucide-react';

/**
 * Panel Lateral (Read-Only) para mesas ocupadas o reservadas
 * - Muestra datos del cliente, mesas asignadas y pago total
 * - Botón para "Liberar/Limpiar Mesa" que la devuelve a Disponible
 */
export default function TableDetailsSidebar({
  isOpen,
  onClose,
  table,
  onReleaseTable
}) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h3 className="font-bold text-base text-slate-800">
              Mesa {table.id}
            </h3>
          </div>
          <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider block mt-0.5">
            Estado: {table.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body details */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Cliente Asignado</span>
            <span className="text-xs font-bold text-slate-800">
              {table.customer_name || 'Cliente en Sala'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Teléfono</span>
            <span className="text-xs font-mono font-semibold text-slate-800">
              {table.phone || '664 000 0000'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Capacidad</span>
            <span className="text-xs font-bold text-slate-800">
              {table.capacity || 4} Personas
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Cobrado</span>
            <span className="text-sm font-bold text-emerald-600">
              ${(table.total_paid || 500).toFixed(2)} MXN
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Estado de Pago</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              100% Pagado
            </span>
          </div>
        </div>

        {table.group_id && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
            <strong>Mesa Fusionada:</strong> Esta mesa comparte cuenta con el grupo operativo asignado.
          </div>
        )}
      </div>

      {/* Footer Action: Liberar / Limpiar Mesa & Eliminar Mesa */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <button
          onClick={() => {
            onReleaseTable(table.id);
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-all shadow-2xs"
        >
          <Trash2 className="w-4 h-4 text-amber-600" />
          <span>Liberar / Limpiar Mesa</span>
        </button>

        {table.onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`¿Estás seguro de quitar la mesa ${table.id} de la sala?`)) {
                table.onDelete(table.id);
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-semibold text-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Quitar Mesa de Sala</span>
          </button>
        )}
      </div>
    </div>
  );
}
