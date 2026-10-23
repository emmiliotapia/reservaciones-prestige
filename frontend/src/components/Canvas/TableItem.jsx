import React from 'react';
import { Users, Link2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  disponible: {
    color: 'border-emerald-500/60 bg-emerald-950/20 text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'DISPONIBLE',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  },
  reservada: {
    color: 'border-blue-500/60 bg-blue-950/25 text-blue-400',
    dot: 'bg-blue-400',
    label: 'RESERVADA',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
  },
  ocupada: {
    color: 'border-rose-500/70 bg-rose-950/30 text-rose-400',
    dot: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
    label: 'OCUPADA',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400'
  },
  limpieza: {
    color: 'border-amber-500/60 bg-amber-950/25 text-amber-400',
    dot: 'bg-amber-400',
    label: 'LIMPIEZA',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  }
};

export default function TableItem({
  table,
  isSelected,
  isInMergeMode,
  onClick,
  onDragStart,
  onStatusChange
}) {
  const currentStatus = statusConfig[table.status] || statusConfig.disponible;
  const isMerged = Boolean(table.group_id);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: `${table.pos_y}px`,
        left: `${table.pos_x}px`,
        width: '104px',
        height: '84px',
      }}
      className={`
        cursor-pointer rounded-xl border p-2 transition-all duration-200 select-none
        backdrop-blur-md flex flex-col justify-between
        ${currentStatus.color}
        ${
          isSelected
            ? 'ring-2 ring-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.45)] scale-105 z-20'
            : 'hover:scale-[1.02] hover:border-slate-400/50 z-10'
        }
        ${isInMergeMode ? 'animate-pulse' : ''}
      `}
      title={`Mesa ${table.label} | Estado: ${table.status}`}
    >
      {/* Header: Label y Capacidad */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-black tracking-wider text-slate-100 flex items-center gap-1">
          {table.label}
          {isMerged && (
            <Link2 className="w-3 h-3 text-[#00FF66]" title="Mesa fusionada" />
          )}
        </span>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <Users className="w-3 h-3" />
          <span>{table.capacity}p</span>
        </div>
      </div>

      {/* Group info if merged */}
      {isMerged && (
        <div className="text-[9px] font-mono text-[#00FF66] truncate opacity-90">
          GRP:{table.group_id.substring(0, 4)}
        </div>
      )}

      {/* Footer: Estado operativo & selector rápido */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
          <span className="text-[9px] font-mono font-bold tracking-tight uppercase">
            {table.status.substring(0, 4)}
          </span>
        </div>

        {/* Status quick toggle on right click / small dropdown */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            const statuses = ['disponible', 'reservada', 'ocupada', 'limpieza'];
            const nextIdx = (statuses.indexOf(table.status) + 1) % statuses.length;
            onStatusChange(table.id, statuses[nextIdx]);
          }}
          className="text-[9px] font-mono text-slate-400 hover:text-white bg-black/40 px-1 py-0.5 rounded cursor-pointer border border-white/5"
          title="Clic para ciclar estado"
        >
          ↻
        </div>
      </div>
    </div>
  );
}
