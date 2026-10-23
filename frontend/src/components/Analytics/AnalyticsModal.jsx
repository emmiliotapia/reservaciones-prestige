import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Clock, Calendar, CheckCircle, BarChart3, Receipt } from 'lucide-react';
import { fetchAnalytics } from '../../services/api';

export default function AnalyticsModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let start = new Date();
      if (dateRange === '24h') start.setHours(start.getHours() - 24);
      if (dateRange === '7d') start.setDate(start.getDate() - 7);
      if (dateRange === '30d') start.setDate(start.getDate() - 30);

      const res = await fetchAnalytics(start.toISOString(), now.toISOString());
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-modal w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-[#00FF66]" />
            <div>
              <h3 className="font-mono font-bold text-base text-white tracking-wide uppercase">
                Panel de Analítica & Auditoría Operativa
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cortes de evento, ocupación en tiempo real y logs de tickets emitidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Range selector */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5 font-mono text-xs">
              {['24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    dateRange === r
                      ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 font-mono text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-[#00FF66] border-t-transparent rounded-full animate-spin"></div>
            <span>Calculando métricas del sistema...</span>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Tasa de Ocupación</span>
                <div className="text-2xl font-mono font-black text-[#00FF66] mt-1">
                  {data?.table_occupancy_rate || 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#00FF66] h-full"
                    style={{ width: `${data?.table_occupancy_rate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Total Reservaciones</span>
                <div className="text-2xl font-mono font-black text-white mt-1">
                  {data?.total_reservations || 0}
                </div>
                <span className="text-[10px] font-mono text-slate-500">En período seleccionado</span>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Activas en Sala</span>
                <div className="text-2xl font-mono font-black text-blue-400 mt-1">
                  {data?.active_reservations || 0}
                </div>
                <span className="text-[10px] font-mono text-slate-500">Mesas reservadas/ocupadas</span>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">En Limpieza</span>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {data?.status_breakdown?.limpieza || 0}
                </div>
                <span className="text-[10px] font-mono text-slate-500">Pendiente de habilitar</span>
              </div>
            </div>

            {/* Distribution and Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status Breakdown */}
              <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h4 className="font-mono text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00FF66]" /> Desglose Operativo (18 Mesas)
                </h4>
                <div className="space-y-2.5 font-mono text-xs">
                  {Object.entries(data?.status_breakdown || {}).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize text-slate-400">{key}:</span>
                      <span className="font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded">
                        {count} ({Math.round((count / 18) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Activity */}
              <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h4 className="font-mono text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00FF66]" /> Distribución Horaria de Eventos
                </h4>
                {Object.keys(data?.hourly_distribution || {}).length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 py-6 text-center">
                    Sin eventos en este intervalo horario
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-xs">
                    {Object.entries(data?.hourly_distribution || {}).map(([hour, count]) => (
                      <div key={hour} className="flex items-center gap-3">
                        <span className="text-slate-400 w-12">{hour}</span>
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#00FF66] h-full"
                            style={{ width: `${Math.min(100, count * 25)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-300 text-[11px]">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tickets Audit Log Snapshot */}
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <h4 className="font-mono text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#00FF66]" /> Registro Reciente de Tickets Impresos (tickets_log)
              </h4>
              <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                {(!data?.recent_tickets || data.recent_tickets.length === 0) ? (
                  <div className="text-xs font-mono text-slate-500 py-4 text-center">
                    No se registran tickets en el snapshot
                  </div>
                ) : (
                  data.recent_tickets.map((t, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-[#00FF66] font-bold">{t.ticket_id}</span>
                        <span className="text-white font-medium">{t.customer_name}</span>
                        <span className="text-slate-500">[{t.tables?.join(', ')}]</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                        <span>{t.time_scheduled}</span>
                        <span className="text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/20">
                          {t.party_size} Pax
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
