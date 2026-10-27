import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  Printer
} from 'lucide-react';

export default function SalesReportModal({
  isOpen,
  onClose,
  activeEvent,
  events,
  tables
}) {
  const [selectedFilterEventId, setSelectedFilterEventId] = useState(
    activeEvent ? activeEvent.id : 'all'
  );

  if (!isOpen) return null;

  // Filtrar mesas ocupadas / reservadas
  const reservedTables = tables.filter(
    (t) => t.status === 'ocupada' || t.status === 'reservada'
  );

  // Totales
  const totalRecaudado = reservedTables.reduce(
    (acc, t) => acc + Number(t.total_paid || 0),
    0
  );
  const totalComensales = reservedTables.reduce(
    (acc, t) => acc + Number(t.party_size || (t.group_id ? 6 : 4)),
    0
  );
  const totalMesasOcupadas = reservedTables.length;

  // Exportar reporte a formato CSV compatible con Excel
  const handleExportCSV = () => {
    let csv = '\uFEFF'; // BOM para compatibilidad con caracteres latinos en Excel
    csv += 'REPORTE DE VENTAS Y RESERVACIONES - CASINO PRESTIGE\n';
    csv += `Evento: ${activeEvent?.name || 'General'}\n`;
    csv += `Fecha Emisión: ${new Date().toLocaleString()}\n\n`;
    csv += 'Mesa,Titular,Teléfono,Comensales (Pax),Monto Pagado (MXN),Estado,Fecha/Hora\n';

    reservedTables.forEach((t) => {
      const mesaName = t.group_id ? `Doble ${t.id}` : `Mesa ${t.id}`;
      const titular = `"${(t.customer_name || 'Cliente en Sala').replace(/"/g, '""')}"`;
      const tel = `"${t.phone || 'N/A'}"`;
      const pax = t.party_size || (t.group_id ? 6 : 4);
      const paid = t.total_paid || 0;
      const status = t.status.toUpperCase();
      const time = t.reserved_at || new Date().toLocaleDateString();

      csv += `${mesaName},${titular},${tel},${pax},${paid},${status},${time}\n`;
    });

    csv += `\nTOTAL RECAUDADO,,,$${totalRecaudado} MXN\n`;
    csv += `TOTAL COMENSALES,,,${totalComensales} Pax\n`;
    csv += `TOTAL MESAS RESERVADAS,,,${totalMesasOcupadas} Mesas\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Reporte_Ventas_${(activeEvent?.name || 'Casino').replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Reporte de Ventas & Reservaciones
              </h3>
              <p className="text-xs text-slate-400">
                Evento: <strong className="text-indigo-300">{activeEvent?.name}</strong> • ${activeEvent?.price_per_person || 500} MXN/pax
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md"
              title="Descargar tabla en formato Excel (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen Métricas Clave (Tarjetas) */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Ingresos</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-emerald-600">
              ${totalRecaudado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Cobro en taquilla / portal</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Comensales (Pax)</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {totalComensales}
            </span>
            <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Personas confirmadas</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Mesas Ocupadas</span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {totalMesasOcupadas} <span className="text-xs font-normal text-slate-400">/ 18 mesas</span>
            </span>
            <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
              {Math.round((totalMesasOcupadas / 18) * 100)}% de ocupación
            </span>
          </div>
        </div>

        {/* Tabla Detallada de Reservaciones */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              Detalle por Mesa y Comprobante
            </h4>
            <span className="text-xs font-medium text-slate-400">
              {reservedTables.length} registros
            </span>
          </div>

          {reservedTables.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Receipt className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Aún no hay reservaciones registradas para este evento.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Mesa</th>
                    <th className="py-2.5 px-3.5">Titular</th>
                    <th className="py-2.5 px-3.5">Teléfono</th>
                    <th className="py-2.5 px-3.5 text-center">Pax</th>
                    <th className="py-2.5 px-3.5 text-right">Pagado</th>
                    <th className="py-2.5 px-3.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reservedTables.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {t.group_id ? `Doble (${t.id})` : t.id}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-800 font-semibold">
                        {t.customer_name || 'Cliente en Sala'}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                        {t.phone || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-bold text-indigo-700">
                        {t.party_size || (t.group_id ? 6 : 4)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-black text-emerald-600">
                        ${Number(t.total_paid || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Casino Prestige • Módulo de Ventas & Finanzas
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
