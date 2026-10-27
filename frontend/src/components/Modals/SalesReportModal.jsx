import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  Printer,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { fetchReservations } from '../../services/api';

export default function SalesReportModal({
  isOpen,
  onClose,
  activeEvent,
  events,
  tables,
  onDeleteReservation
}) {
  const [selectedFilterEventName, setSelectedFilterEventName] = useState(
    activeEvent ? activeEvent.name : 'all'
  );
  const [dbReservations, setDbReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar historial de reservaciones desde la base de datos de PostgreSQL del VPS
  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchReservations(true);
      if (Array.isArray(data)) {
        setDbReservations(data);
      }
    } catch (e) {
      console.warn("No se pudo cargar historial de reservaciones de la BD:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReservations();
      setSelectedFilterEventName(activeEvent ? activeEvent.name : 'all');
    }
  }, [isOpen, activeEvent]);

  if (!isOpen) return null;

  // Filtrar reservaciones según evento seleccionado
  const filteredReservations = dbReservations.filter((r) => {
    if (selectedFilterEventName === 'all') return true;
    return r.event_name === selectedFilterEventName;
  });

  // Si aún no hay reservaciones en BD, recurrir a las mesas ocupadas en la pantalla actual
  const useFallbackTables = filteredReservations.length === 0 && tables.some(t => t.status === 'ocupada');
  const fallbackList = tables.filter(t => t.status === 'ocupada' || t.status === 'reservada');

  // Totales calculados
  const totalRecaudado = useFallbackTables
    ? fallbackList.reduce((acc, t) => acc + Number(t.total_paid || 0), 0)
    : filteredReservations.reduce((acc, r) => acc + Number(r.total_paid || 0), 0);

  const totalComensales = useFallbackTables
    ? fallbackList.reduce((acc, t) => acc + Number(t.party_size || 4), 0)
    : filteredReservations.reduce((acc, r) => acc + Number(r.party_size || 4), 0);

  const totalMesasOcupadas = useFallbackTables
    ? fallbackList.length
    : filteredReservations.length;

  // Exportar reporte a formato CSV compatible con Excel
  const handleExportCSV = () => {
    let csv = '\uFEFF'; // BOM para compatibilidad con caracteres latinos en Excel
    csv += 'REPORTE DE VENTAS Y RESERVACIONES - CASINO PRESTIGE\n';
    csv += `Evento: ${selectedFilterEventName === 'all' ? 'Todos los Eventos' : selectedFilterEventName}\n`;
    csv += `Fecha Emisión: ${new Date().toLocaleString()}\n\n`;
    csv += 'ID Folio,Evento,Titular,Teléfono,Comensales (Pax),Monto Pagado (MXN),Fecha Programada\n';

    if (!useFallbackTables) {
      filteredReservations.forEach((r) => {
        const folio = `"TKT-${String(r.id).padStart(5, '0')}"`;
        const evName = `"${(r.event_name || 'Día Prestige').replace(/"/g, '""')}"`;
        const titular = `"${(r.customer_name || 'Cliente').replace(/"/g, '""')}"`;
        const tel = `"${r.phone || 'N/A'}"`;
        const pax = r.party_size || 4;
        const paid = r.total_paid || 0;
        const time = r.time_scheduled ? new Date(r.time_scheduled).toLocaleString() : 'N/A';
        csv += `${folio},${evName},${titular},${tel},${pax},${paid},${time}\n`;
      });
    } else {
      fallbackList.forEach((t) => {
        const folio = `"${t.id}"`;
        const evName = `"${activeEvent?.name || 'Día Prestige'}"`;
        const titular = `"${(t.customer_name || 'Cliente en Sala').replace(/"/g, '""')}"`;
        const tel = `"${t.phone || 'N/A'}"`;
        const pax = t.party_size || 4;
        const paid = t.total_paid || 0;
        const time = new Date().toLocaleString();
        csv += `${folio},${evName},${titular},${tel},${pax},${paid},${time}\n`;
      });
    }

    csv += `\nTOTAL RECAUDADO,,,${totalRecaudado} MXN\n`;
    csv += `TOTAL COMENSALES,,,${totalComensales} Pax\n`;
    csv += `TOTAL RESERVAS REGISTRADAS,,,${totalMesasOcupadas}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Reporte_Ventas_${(selectedFilterEventName || 'Casino').replace(/\s+/g, '_')}_${Date.now()}.csv`
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
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                Detalle de Reservaciones Registradas
              </h4>
              <button
                onClick={loadReservations}
                disabled={loading}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                title="Actualizar datos de la BD"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Selector de Evento */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">Filtrar por Evento:</span>
              <select
                value={selectedFilterEventName}
                onChange={(e) => setSelectedFilterEventName(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos los Eventos</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.name}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(!useFallbackTables && filteredReservations.length === 0) || (useFallbackTables && fallbackList.length === 0) ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Receipt className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Aún no hay reservaciones registradas para este evento.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Folio / Ticket</th>
                    <th className="py-2.5 px-3.5">Evento</th>
                    <th className="py-2.5 px-3.5">Titular</th>
                    <th className="py-2.5 px-3.5">Teléfono</th>
                    <th className="py-2.5 px-3.5 text-center">Pax</th>
                    <th className="py-2.5 px-3.5 text-right">Pagado</th>
                    <th className="py-2.5 px-3.5 text-center">Estado</th>
                    <th className="py-2.5 px-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {!useFallbackTables ? (
                    filteredReservations.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono">
                          TKT-{String(r.id).padStart(5, '0')}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                          {r.event_name || 'Día Prestige'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-900 font-bold">
                          {r.customer_name || 'Cliente'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                          {r.phone || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-bold text-indigo-700">
                          {r.party_size || 4} Pax
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-black text-emerald-600">
                          ${Number(r.total_paid || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                            Confirmado
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {onDeleteReservation && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteReservation(r);
                                onClose();
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Borrar registro de venta (Requiere NIP)"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    fallbackList.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900">
                          {t.group_id ? `Doble (${t.id})` : t.id}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                          {activeEvent?.name || 'Día Prestige'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-900 font-bold">
                          {t.customer_name || 'Cliente en Sala'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                          {t.phone || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-bold text-indigo-700">
                          {t.party_size || 4} Pax
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
                    ))
                  )}
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
