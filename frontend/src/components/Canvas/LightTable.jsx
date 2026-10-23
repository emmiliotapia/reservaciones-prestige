import React from 'react';
import { RotateCw, Unlink, User, DollarSign } from 'lucide-react';

/**
 * Mesa cuadrada individual o rectangular doble en Light Mode minimalista
 * - aspect-square para mesas individuales
 * - aspect-[2/1] o aspect-[1/2] para mesas dobles
 * - Colores pastel suaves:
 *   - Disponible: bg-emerald-100 text-emerald-700 border-emerald-300
 *   - Reservada: bg-blue-100 text-blue-700 border-blue-300
 *   - Ocupada: bg-rose-100 text-rose-700 border-rose-300
 */
export default function LightTable({
  table,
  isMergedDouble = false,
  mergedTables = [],
  isSelected,
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
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm hover:border-emerald-400',
          badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Disponible'
        };
      case 'reservada':
      case 'reserved':
        return {
          bg: 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm hover:border-blue-400',
          badge: 'bg-blue-50 text-blue-600 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Reservada'
        };
      case 'ocupada':
      case 'occupied':
      default:
        return {
          bg: 'bg-rose-100 text-rose-700 border-rose-300 shadow-sm hover:border-rose-400',
          badge: 'bg-rose-50 text-rose-600 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Ocupada'
        };
    }
  };

  const theme = getTheme();

  if (isMergedDouble) {
    const isHorizontal = orientation === 'horizontal';
    const labels = mergedTables.map((t) => t.id).join(' + ');

    return (
      <div
        onClick={onClick}
        style={{
          position: 'absolute',
          left: `${table.x}%`,
          top: `${table.y}%`,
          transform: 'translate(-50%, -50%)',
          width: isHorizontal ? '96px' : '52px',
          height: isHorizontal ? '52px' : '96px',
        }}
        className={`
          cursor-pointer select-none rounded-xl border-2 transition-all duration-200
          flex flex-col items-center justify-between p-2 relative group z-20
          ${theme.bg}
          ${isSelected ? 'ring-2 ring-slate-900 shadow-md scale-105' : 'hover:scale-[1.03]'}
        `}
        title={`Mesa Doble (${labels}) - Clic para ver detalles`}
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pointer-events-none">
          <span className="text-[10px] font-bold tracking-tight uppercase">
            DOBLE
          </span>
          <span className="w-2 h-2 rounded-full ${theme.dot}"></span>
        </div>

        {/* Labels */}
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <span className="font-bold text-xs tracking-tight text-slate-800">
            {labels}
          </span>
          <span className="text-[10px] font-medium opacity-80">
            {theme.label}
          </span>
        </div>

        {/* Floating action buttons on hover/select */}
        <div className="absolute -top-3 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Rotate Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotateOrientation(table.group_id);
            }}
            className="p-1 rounded-full bg-white border border-slate-300 shadow-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
            title="Alternar orientación horizontal/vertical"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Unmerge Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnmerge(table.group_id);
            }}
            className="p-1 rounded-full bg-white border border-slate-300 shadow-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
            title="Dividir en mesas individuales"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Mesa Cuadrada Individual (aspect-square)
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${table.x}%`,
        top: `${table.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '52px',
        height: '52px',
      }}
      className={`
        cursor-pointer select-none rounded-lg border-2 transition-all duration-200
        aspect-square flex flex-col items-center justify-center p-1 relative
        ${theme.bg}
        ${isSelected ? 'ring-2 ring-slate-900 shadow-md scale-110 z-20' : 'hover:scale-105 z-10'}
      `}
      title={`${table.id} (${theme.label}) - Clic para ${status === 'disponible' ? 'reservar' : 'ver detalles'}`}
    >
      <span className="font-extrabold text-xs tracking-tight text-slate-800">
        {table.id}
      </span>
      <span className="text-[9px] font-medium leading-none opacity-85 mt-0.5">
        {table.capacity || 4}p
      </span>
    </div>
  );
}
