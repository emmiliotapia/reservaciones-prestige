import React, { useState, useRef, useEffect } from 'react';
import DiamondTable from './DiamondTable';
import GroupGlowOverlay from './GroupGlowOverlay';
import { Layers, Move, RefreshCw, Eye, EyeOff, Sparkles, Sliders } from 'lucide-react';

export default function FloorCanvas({
  tables,
  selectedTableIds,
  onToggleTableSelect,
  onStatusChange,
  onTablePositionChange,
  onAutoMerge,
  onRefresh
}) {
  const [draggedTableId, setDraggedTableId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nearMergeTarget, setNearMergeTarget] = useState(null);
  const [showBlueprintBg, setShowBlueprintBg] = useState(true);
  const [blueprintOpacity, setBlueprintOpacity] = useState(0.25);
  const canvasRef = useRef(null);

  // Distancia límite en píxeles para auto-fusión magnética ("juntar dos mesas")
  const MERGE_THRESHOLD = 70;

  const handleMouseDown = (e, table) => {
    if (e.button !== 0) return; // solo click izquierdo
    if (e.target.closest('button')) return;

    setDraggedTableId(table.id);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - canvasRect.left - table.pos_x,
      y: e.clientY - canvasRect.top - table.pos_y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedTableId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    let newX = Math.round(e.clientX - rect.left - dragOffset.x);
    let newY = Math.round(e.clientY - rect.top - dragOffset.y);

    // Contener dentro del canvas (590 x 960)
    newX = Math.max(10, Math.min(newX, 510));
    newY = Math.max(10, Math.min(newY, 890));

    // Detectar si estamos acercándonos a otra mesa para Auto-Fusión
    let closestTarget = null;
    let minDistance = Infinity;

    tables.forEach((other) => {
      if (other.id !== draggedTableId) {
        const dx = (other.pos_x + 34) - (newX + 34);
        const dy = (other.pos_y + 34) - (newY + 34);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MERGE_THRESHOLD && dist < minDistance) {
          minDistance = dist;
          closestTarget = other;
        }
      }
    });

    setNearMergeTarget(closestTarget ? closestTarget.id : null);
    onTablePositionChange(draggedTableId, newX, newY);
  };

  const handleMouseUp = () => {
    if (draggedTableId && nearMergeTarget) {
      // Disparar auto-fusión de las dos mesas
      onAutoMerge(draggedTableId, nearMergeTarget);
    }
    setDraggedTableId(null);
    setNearMergeTarget(null);
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden flex flex-col bg-[#030712]">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00FF66]" />
            <h2 className="font-mono font-bold text-sm tracking-wide text-white uppercase">
              PLANO ARQUITECTÓNICO DE SALA (18 MESAS)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00FF66]" />
            Auto-Fusión Magnética Activa: Arrastra dos mesas juntas
          </span>
        </div>

        {/* Blueprint Toggle & Opacity Slider */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setShowBlueprintBg(!showBlueprintBg)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white"
              title="Mostrar u ocultar calco arquitectónico de fondo"
            >
              {showBlueprintBg ? <Eye className="w-4 h-4 text-[#00FF66]" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              <span>Plano Calco</span>
            </button>
            {showBlueprintBg && (
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={blueprintOpacity}
                onChange={(e) => setBlueprintOpacity(parseFloat(e.target.value))}
                className="w-16 accent-[#00FF66] cursor-pointer"
                title="Ajustar opacidad del calco"
              />
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refrescar mesas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blueprint Canvas Scrollable Area */}
      <div
        className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-6 bg-[#030712]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Exact Architectural Canvas Container matching the 268 x 438 layout at 2.2x scale: 590px x 964px */}
        <div
          ref={canvasRef}
          id="canvas-container"
          className="relative rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden select-none bg-[#070b14]"
          style={{
            width: '590px',
            height: '964px',
            minWidth: '590px',
            minHeight: '964px',
          }}
        >
          {/* Subtle Cyberpunk Architectural Grid Lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 102, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 102, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px'
            }}
          />

          {/* Calco del Plano Arquitectónico Original */}
          {showBlueprintBg && (
            <img
              src="/blueprint.png"
              alt="Plano Arquitectónico"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none filter invert contrast-125"
              style={{ opacity: blueprintOpacity }}
            />
          )}

          {/* Architectural Zones Markers */}
          <div className="absolute top-2 left-4 text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase pointer-events-none">
            [ COCINA / PLANCHA / CAFÉ ]
          </div>
          <div className="absolute top-28 left-4 text-[10px] font-mono font-bold text-[#00FF66]/60 tracking-wider uppercase pointer-events-none">
            [ BARRA RESTAURANTE ENTREGA PLATILLO ]
          </div>
          <div className="absolute bottom-6 left-6 text-[10px] font-mono font-bold text-amber-500/70 tracking-wider uppercase pointer-events-none">
            [ SILLÓN VIP / ESCALERAS BAJA ]
          </div>

          {/* Dynamic SVG Grouping Glow Overlay */}
          <GroupGlowOverlay tables={tables} />

          {/* Render 18 Diamond Tables */}
          {tables.map((table) => (
            <DiamondTable
              key={table.id}
              table={table}
              isSelected={selectedTableIds.includes(table.id)}
              isNearMergeTarget={nearMergeTarget === table.id}
              onMouseDown={(e) => handleMouseDown(e, table)}
              onClick={() => onToggleTableSelect(table.id)}
              onStatusCycle={(id) => {
                const statuses = ['disponible', 'reservada', 'ocupada', 'limpieza'];
                const next = statuses[(statuses.indexOf(table.status) + 1) % statuses.length];
                onStatusChange(id, next);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
