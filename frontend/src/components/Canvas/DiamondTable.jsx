import React from 'react';

/**
 * Representación visual rotada a 45° tipo diamante (como el plano arquitectónico original)
 * con sillas perimetrales, indicador de comensales, estado y estilo moderno Casino Lounge.
 */
const statusThemes = {
  disponible: {
    base: 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    tableTop: 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/90 border-emerald-400/80',
    chair: 'bg-emerald-800/80 border-emerald-400/50',
    dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'DISP'
  },
  reservada: {
    base: 'bg-blue-950/70 border-blue-500/70 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    tableTop: 'bg-gradient-to-br from-blue-900/60 to-blue-950/90 border-blue-400/80',
    chair: 'bg-blue-800/80 border-blue-400/50',
    dot: 'bg-blue-400 shadow-[0_0_8px_#3b82f6]',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    label: 'RESV'
  },
  ocupada: {
    base: 'bg-rose-950/70 border-rose-500/70 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.35)]',
    tableTop: 'bg-gradient-to-br from-rose-900/70 to-rose-950/95 border-rose-400/90',
    chair: 'bg-rose-800/80 border-rose-400/50',
    dot: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    label: 'OCUP'
  },
  limpieza: {
    base: 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    tableTop: 'bg-gradient-to-br from-amber-900/60 to-amber-950/90 border-amber-400/80',
    chair: 'bg-amber-800/80 border-amber-400/50',
    dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    label: 'LIMP'
  }
};

export default function DiamondTable({
  table,
  isSelected,
  isNearMergeTarget,
  onMouseDown,
  onClick,
  onStatusCycle
}) {
  const theme = statusThemes[table.status] || statusThemes.disponible;
  const isMerged = Boolean(table.group_id);

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${table.pos_x}px`,
        top: `${table.pos_y}px`,
        width: '68px',
        height: '68px',
      }}
      className={`
        cursor-grab active:cursor-grabbing select-none transition-transform duration-150
        flex items-center justify-center
        ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}
        ${isNearMergeTarget ? 'ring-4 ring-[#00FF66] animate-pulse z-40' : ''}
      `}
      title={`${table.label} (Arrastra cerca de otra mesa para fusionar)`}
    >
      {/* Halo de selección / resplandor */}
      {isSelected && (
        <div className="absolute inset-[-8px] rounded-2xl border-2 border-[#00FF66] shadow-[0_0_20px_#00FF66] animate-pulse pointer-events-none" />
      )}

      {/* 4 Sillas perimetrales (estilo plano arquitectónico) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Silla Superior */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-t-md border ${theme.chair}`} />
        {/* Silla Inferior */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-b-md border ${theme.chair}`} />
        {/* Silla Izquierda */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-4 rounded-l-md border ${theme.chair}`} />
        {/* Silla Derecha */}
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-4 rounded-r-md border ${theme.chair}`} />
      </div>

      {/* Mesa central en Diamante (Rotada 45deg) */}
      <div
        className={`
          w-10 h-10 rounded-md border transform rotate-45 flex items-center justify-center
          backdrop-blur-md transition-colors ${theme.tableTop}
        `}
      >
        {/* Contenido contra-rotado a 0deg para legibilidad vertical */}
        <div className="transform -rotate-45 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-mono font-black text-[11px] tracking-tight text-white leading-none drop-shadow">
            {table.label}
          </span>
          <span className="font-mono text-[8px] font-bold text-slate-300 leading-none mt-0.5">
            {table.capacity}p
          </span>
        </div>
      </div>

      {/* Botón flotante para cambiar de estado */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusCycle(table.id);
        }}
        className={`
          absolute -bottom-2 -right-1 px-1 py-0.5 rounded font-mono text-[8px] font-bold
          border backdrop-blur-md ${theme.badge} hover:brightness-125 transition-all z-20
        `}
        title="Clic para cambiar estado"
      >
        {theme.label}
      </button>

      {/* Indicador de Unión (Group ID) */}
      {isMerged && (
        <div
          className="absolute -top-2.5 px-1 py-0.2 rounded-full bg-[#00FF66] text-black font-mono font-extrabold text-[8px] shadow-[0_0_8px_#00FF66] z-20"
          title={`Fusionada: ${table.group_id}`}
        >
          DOBLE
        </div>
      )}
    </div>
  );
}
