import React from 'react';
import { RotateCw, Unlink, Users } from 'lucide-react';

/**
 * Mesa interactiva con soporte completo para Drag & Drop:
 * - Disponible: Verde pastel suave
 * - Reservada: Azul pastel suave
 * - Ocupada: Rojo coral suave
 * - Muestra comensales (hasta 4 en individual, hasta 8 en dobles)
 */
export default function InteractiveTable({
  table,
  isMergedDouble = false,
  mergedTables = [],
  isSelected,
  onMouseDown,
  onClick,
  onRotateOrientation,
  onUnmerge
}) {
  const status = table.status || 'disponible';
  const orientation = table.orientation || 'horizontal';

  const getTheme = () => {
    switch (status) {
      case 'disponible':
      case 'available':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm hover:border-emerald-400',
          badge: 'bg-emerald-100 text-emerald-700',
          dot: 'bg-emerald-500',
          label: 'Disponible'
        };
      case 'reservada':
      case 'reserved':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm hover:border-sky-400',
          badge: 'bg-sky-100 text-sky-700',
          dot: 'bg-sky-500',
          label: 'Reservada'
        };
      case 'ocupada':
      case 'occupied':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm hover:border-rose-400',
          badge: 'bg-rose-100 text-rose-700',
          dot: 'bg-rose-500',
          label: 'Ocupada'
        };
    }
  };

  const theme = getTheme();

  // Mesa Doble Rectangular (ocupa 2 plazas en el punto medio)
  if (isMergedDouble) {
    const isHorizontal = orientation === 'horizontal';
    const labels = mergedTables.map((t) => t.id).join(' + ');
    const maxCapacity = 8;
    const currentParty = mergedTables.reduce((sum, t) => sum + (t.party_size || 4), 0);

    return (
      <div
        onMouseDown={onMouseDown}
        onClick={onClick}
        style={{
          position: 'absolute',
          left: `${table.x}%`,
          top: `${table.y}%`,
          transform: 'translate(-50%, -50%)',
          width: isHorizontal ? '128px' : '68px',
          height: isHorizontal ? '68px' : '128px',
        }}
        className={`
          cursor-grab active:cursor-grabbing select-none rounded-2xl border-2 transition-all duration-150
          flex flex-col items-center justify-between p-2.5 relative group z-20 backdrop-blur-sm
          ${theme.bg}
          ${isSelected ? 'ring-2 ring-slate-800 shadow-lg scale-105' : 'hover:scale-[1.02] shadow-sm'}
        `}
        title={`Mesa Doble (${labels}) - Arrástrala o haz clic para gestionar`}
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pointer-events-none">
          <span className="text-[10px] font-extrabold tracking-wider uppercase bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
            DOBLE
          </span>
          <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
        </div>

        {/* Labels & Comensales */}
        <div className="flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="font-extrabold text-xs text-slate-800 tracking-tight">
            {labels}
          </span>
          <span className="text-[11px] font-semibold flex items-center gap-1 text-slate-600 mt-0.5">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{currentParty}/{maxCapacity} Pax</span>
          </span>
        </div>

        {/* Floating action buttons */}
        <div className="absolute -top-3.5 right-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotateOrientation(table.group_id);
            }}
            className="p-1.5 rounded-full bg-white border border-slate-300 shadow-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
            title="Alternar orientación horizontal/vertical"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnmerge(table.group_id);
            }}
            className="p-1.5 rounded-full bg-white border border-slate-300 shadow-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
            title="Dividir en mesas individuales"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Mesa Cuadrada Individual (hasta 4 comensales)
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${table.x}%`,
        top: `${table.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '64px',
        height: '64px',
      }}
      className={`
        cursor-grab active:cursor-grabbing select-none rounded-xl border-2 transition-all duration-150
        aspect-square flex flex-col items-center justify-between p-1.5 relative
        ${theme.bg}
        ${isSelected ? 'ring-2 ring-slate-800 shadow-md scale-110 z-20' : 'hover:scale-105 z-10'}
      `}
      title={`${table.id} (${theme.label}) - Arrastra hacia otra mesa para fusionar o haz clic para reservar`}
    >
      <div className="w-full flex items-center justify-between pointer-events-none">
        <span className="font-extrabold text-xs text-slate-800">
          {table.id}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
      </div>

      <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-0.5 pointer-events-none">
        <Users className="w-2.5 h-2.5 text-slate-400" />
        <span>{table.party_size || 4}/4p</span>
      </div>

      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight pointer-events-none">
        {theme.label}
      </span>
    </div>
  );
}
