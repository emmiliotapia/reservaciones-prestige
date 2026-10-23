import React, { useState, useRef } from 'react';
import ArchitectDiamondTable from './ArchitectDiamondTable';
import { Layers, Sparkles, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function RestaurantLayoutCanvas({
  tables,
  selectedTableIds,
  onToggleTableSelect,
  onStatusChange,
  onTablePositionPercentChange,
  onAutoMerge,
  onRefresh
}) {
  const [draggedTableId, setDraggedTableId] = useState(null);
  const [nearMergeTarget, setNearMergeTarget] = useState(null);
  const [showRealPlanCalco, setShowRealPlanCalco] = useState(false);
  const containerRef = useRef(null);

  // Distancia en porcentaje para fusionar magnéticamente dos mesas al soltarlas
  const MERGE_THRESHOLD_PERCENT = 14;

  const handleMouseDown = (e, table) => {
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;

    setDraggedTableId(table.id);
  };

  const handleMouseMove = (e) => {
    if (!draggedTableId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Calcular posición porcentual exacta respecto al contenedor aspect-[2/3]
    let newXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let newYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Limitar dentro del lienzo con márgenes de seguridad
    newXPercent = Math.max(6, Math.min(newXPercent, 94));
    newYPercent = Math.max(22, Math.min(newYPercent, 94));

    // Detección de proximidad magnética para auto-fusión
    let closestTarget = null;
    let minDistance = Infinity;

    tables.forEach((other) => {
      if (other.id !== draggedTableId) {
        const dx = other.x - newXPercent;
        const dy = other.y - newYPercent;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MERGE_THRESHOLD_PERCENT && dist < minDistance) {
          minDistance = dist;
          closestTarget = other;
        }
      }
    });

    setNearMergeTarget(closestTarget ? closestTarget.id : null);
    onTablePositionPercentChange(draggedTableId, Math.round(newXPercent), Math.round(newYPercent));
  };

  const handleMouseUp = () => {
    if (draggedTableId && nearMergeTarget) {
      onAutoMerge(draggedTableId, nearMergeTarget);
    }
    setDraggedTableId(null);
    setNearMergeTarget(null);
  };

  // Renderizar envoltorios para grupos / mesas dobles
  const groups = {};
  tables.forEach((t) => {
    if (t.group_id) {
      if (!groups[t.group_id]) groups[t.group_id] = [];
      groups[t.group_id].push(t);
    }
  });

  return (
    <div
      className="flex-1 w-full h-full overflow-auto flex flex-col bg-[#030712] font-['JetBrains_Mono'] select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-800 bg-[#0b0f19]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00FF66]" />
            <h2 className="font-bold text-sm tracking-wide text-white uppercase">
              PLANO ARQUITECTÓNICO RESTAURANTE & CASINO
            </h2>
          </div>
          <span className="text-xs text-[#00FF66] bg-[#00FF66]/10 px-3 py-1 rounded-full border border-[#00FF66]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,102,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            Drag & Drop Activo: Junta dos mesas para hacerlas DOBLES
          </span>
        </div>

        {/* Legend and Tools */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#00FF66]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]"></span> Disponible
            </span>
            <span className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]"></span> Reservada
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span> Ocupada
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Limpieza
            </span>
          </div>

          <button
            onClick={() => setShowRealPlanCalco(!showRealPlanCalco)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
            title="Alternar calco de plano original"
          >
            {showRealPlanCalco ? <Eye className="w-3.5 h-3.5 text-[#00FF66]" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
            <span>Calco Plano</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Refrescar estado de mesas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Floor Blueprint Container with fixed 2/3 aspect ratio */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          ref={containerRef}
          className="relative w-full max-w-2xl aspect-[2/3] bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Opcional: Calco original superpuesto */}
          {showRealPlanCalco && (
            <img
              src="/blueprint.png"
              alt="Plano original"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-20 filter invert contrast-150 z-0"
            />
          )}

          {/* Capa 1: Referencias arquitectónicas sutiles como plano base (solo referencia) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
            viewBox="0 0 100 150"
            preserveAspectRatio="none"
          >
            {/* Zona Superior: Cocina y Barra */}
            <rect x="5" y="2" width="25" height="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="1 1" />
            <text x="17" y="8" fill="#4b5563" fontSize="2.2" textAnchor="middle" fontWeight="bold">CAFÉ</text>
            
            <rect x="35" y="2" width="40" height="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="1 1" />
            <text x="55" y="10" fill="#4b5563" fontSize="2.2" textAnchor="middle" fontWeight="bold">PREPARACIÓN / PLANCHA</text>

            <rect x="10" y="19" width="75" height="6.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
            <text x="47" y="23.5" fill="#6b7280" fontSize="2.2" textAnchor="middle" fontWeight="bold">BARRA DE RESTAURANTE ENTREGA DE PLATILLO</text>

            {/* Zona Inferior Izquierda: Sillón VIP en L (Referencia en fondo sutil) */}
            <path d="M 5 95 L 18 95 L 18 120 L 5 120 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="1 1" />
            <path d="M 5 120 L 5 130 L 22 130 L 22 120 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="1 1" />
            <text x="12" y="115" fill="#374151" fontSize="1.8" textAnchor="middle">SILLÓN VIP</text>

            {/* Zona Inferior Derecha: Escaleras y rampa */}
            <path d="M 75 125 L 100 125 L 100 150 L 75 150 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="1 1" />
            <path d="M 75 125 L 85 108 L 100 114" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
            {/* Líneas de escalones */}
            <line x1="75" y1="130" x2="100" y2="130" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            <line x1="75" y1="135" x2="100" y2="135" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            <line x1="75" y1="140" x2="100" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            <line x1="75" y1="145" x2="100" y2="145" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            <text x="87" y="140" fill="#374151" fontSize="2" textAnchor="middle">ESCALERA</text>
          </svg>

          {/* Capa 2: Conectores SVG dinámicos para Mesas Dobles Fusionadas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Object.entries(groups).map(([grpId, grpTables]) => {
              if (grpTables.length < 2) return null;
              const minX = Math.min(...grpTables.map((t) => t.x)) - 5;
              const maxX = Math.max(...grpTables.map((t) => t.x)) + 5;
              const minY = Math.min(...grpTables.map((t) => t.y)) - 4;
              const maxY = Math.max(...grpTables.map((t) => t.y)) + 4;
              return (
                <g key={grpId}>
                  <rect
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    rx="2"
                    fill="rgba(0, 255, 102, 0.12)"
                    stroke="#00FF66"
                    strokeWidth="0.4"
                    strokeDasharray="1 0.8"
                  />
                  {grpTables.map((t, idx) => {
                    if (idx === 0) return null;
                    const prev = grpTables[idx - 1];
                    return (
                      <line
                        key={`${t.id}-${prev.id}`}
                        x1={prev.x}
                        y1={prev.y}
                        x2={t.x}
                        y2={t.y}
                        stroke="#00FF66"
                        strokeWidth="0.6"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Capa 3: Mesas Interactivas con Posicionamiento Absoluto en Porcentajes */}
          {tables.map((table) => (
            <ArchitectDiamondTable
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
