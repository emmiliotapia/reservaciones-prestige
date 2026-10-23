import React from 'react';

/**
 * Mesa en diamante rotada a 45° basada en el diseño del agente con:
 * - Posicionamiento en porcentajes responsivo (left %, top %)
 * - Sillas en bg-current
 * - Estados de color casino (available: #00FF66, reserved: yellow-400, occupied: red-500, cleaning: amber-500)
 * - Indicador de mesa doble (fusionada)
 * - Drag & Drop fluido
 */

export default function ArchitectDiamondTable({
  table,
  isSelected,
  isNearMergeTarget,
  onMouseDown,
  onClick,
  onStatusCycle
}) {
  const isMerged = Boolean(table.group_id);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'disponible':
      case 'available':
        return {
          border: 'border-[#00FF66]',
          text: 'text-[#00FF66]',
          glow: 'shadow-[0_0_15px_rgba(0,255,102,0.4)]',
          badge: 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30',
          label: 'DISP'
        };
      case 'reservada':
      case 'reserved':
        return {
          border: 'border-yellow-400',
          text: 'text-yellow-400',
          glow: 'shadow-[0_0_15px_rgba(250,204,21,0.35)]',
          badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
          label: 'RESV'
        };
      case 'ocupada':
      case 'occupied':
        return {
          border: 'border-red-500',
          text: 'text-red-500',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
          badge: 'bg-red-500/10 text-red-500 border-red-500/30',
          label: 'OCUP'
        };
      case 'limpieza':
      default:
        return {
          border: 'border-amber-500',
          text: 'text-amber-500',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          label: 'LIMP'
        };
    }
  };

  const styleConfig = getStatusClasses(table.status);

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${table.x}%`,
        top: `${table.y}%`,
      }}
      className={`
        absolute w-12 h-12 -ml-6 -mt-6 cursor-grab active:cursor-grabbing select-none
        flex items-center justify-center transition-transform duration-150
        ${isSelected ? 'scale-125 z-30 ring-2 ring-white rounded-sm shadow-[0_0_25px_rgba(0,255,102,0.8)]' : 'hover:scale-110 z-10'}
        ${isNearMergeTarget ? 'ring-4 ring-[#00FF66] scale-125 animate-pulse z-40' : ''}
      `}
      title={`${table.id} (${table.status.toUpperCase()}) - Clic para seleccionar, arrastra hacia otra mesa para fusionar`}
    >
      {/* Mesa central en Diamante (Rotada 45deg) */}
      <div
        className={`
          w-full h-full flex items-center justify-center transform rotate-45 border-2
          bg-[#0b0f19]/90 backdrop-blur-sm relative transition-colors duration-200
          ${styleConfig.border} ${styleConfig.text} ${styleConfig.glow}
        `}
      >
        {/* Sillas perimetrales decorativas (bg-current) */}
        <div className="absolute -top-2 left-1/2 w-4 h-1 bg-current transform -translate-x-1/2 rounded-t-sm"></div>
        <div className="absolute -bottom-2 left-1/2 w-4 h-1 bg-current transform -translate-x-1/2 rounded-b-sm"></div>
        <div className="absolute top-1/2 -left-2 w-1 h-4 bg-current transform -translate-y-1/2 rounded-l-sm"></div>
        <div className="absolute top-1/2 -right-2 w-1 h-4 bg-current transform -translate-y-1/2 rounded-r-sm"></div>

        {/* Texto contrarrotado para lectura perfecta a 0° */}
        <span className="transform -rotate-45 text-xs font-bold font-mono tracking-tight text-white drop-shadow">
          {table.id}
        </span>
      </div>

      {/* Tag de Mesa Doble si está fusionada */}
      {isMerged && (
        <div className="absolute -top-4 px-1.5 py-0.2 rounded-full bg-[#00FF66] text-black font-mono font-black text-[8px] shadow-[0_0_10px_#00FF66] z-20">
          DOBLE
        </div>
      )}

      {/* Botón flotante para ciclar estado */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusCycle(table.id);
        }}
        className={`
          absolute -bottom-3 px-1 py-0.2 rounded font-mono text-[7px] font-extrabold border
          ${styleConfig.badge} hover:brightness-150 transition-all z-20 backdrop-blur-md
        `}
        title="Clic para cambiar estado"
      >
        {styleConfig.label}
      </button>
    </div>
  );
}
