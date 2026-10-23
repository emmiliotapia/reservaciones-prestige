import React, { useRef, useState } from 'react';
import InteractiveTable from './InteractiveTable';
import { Sparkles, Move } from 'lucide-react';

/**
 * Lienzo Amplio y Descansado (Warm Slate / Neutral Lounge)
 * - Dimensiones generosas y amplias en pantalla (max-w-4xl, aspecto real sin recortes)
 * - Entrada y Salida ubicada exactamente a un lado de Cajas y Recepción (zona inferior izquierda)
 * - Zona inferior derecha como espacio no utilizable del salón (vacío arquitectónico natural)
 * - Soporte total de Drag & Drop para recolocar mesas y auto-fusionar al soltar una sobre otra
 */
export default function SpaciousLoungeCanvas({
  tables,
  selectedTableIds,
  onTableClick,
  onTablePositionChange,
  onAutoMerge,
  onRotateOrientation,
  onUnmerge
}) {
  const containerRef = useRef(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nearTargetId, setNearTargetId] = useState(null);

  // Umbral magnético en porcentaje para fusión automática
  const MERGE_THRESHOLD = 9;

  const handleMouseDown = (e, table) => {
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;

    setDraggedId(table.id);
    const rect = containerRef.current.getBoundingClientRect();
    const currentXPixel = (table.x / 100) * rect.width;
    const currentYPixel = (table.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - currentXPixel,
      y: e.clientY - rect.top - currentYPixel
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let newXPercent = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let newYPercent = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Confinar dentro del área útil de sala
    newXPercent = Math.max(8, Math.min(newXPercent, 92));
    newYPercent = Math.max(22, Math.min(newYPercent, 90));

    // Si es una mesa individual no fusionada, detectar proximidad magnética para merge
    const isSingleTable = tables.some((t) => t.id === draggedId && !t.group_id);
    let closest = null;
    let minDist = Infinity;

    if (isSingleTable) {
      tables.forEach((t) => {
        if (t.id !== draggedId && !t.group_id) {
          const dx = t.x - newXPercent;
          const dy = t.y - newYPercent;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MERGE_THRESHOLD && dist < minDist) {
            minDist = dist;
            closest = t;
          }
        }
      });
    }

    setNearTargetId(closest ? closest.id : null);
    onTablePositionChange(draggedId, Math.round(newXPercent), Math.round(newYPercent));
  };

  const handleMouseUp = () => {
    if (draggedId && nearTargetId) {
      onAutoMerge(draggedId, nearTargetId);
    }
    setDraggedId(null);
    setNearTargetId(null);
  };

  // Identificar mesas dobles agrupadas
  const groups = {};
  const processedTableIds = new Set();

  tables.forEach((t) => {
    if (t.group_id) {
      if (!groups[t.group_id]) groups[t.group_id] = [];
      groups[t.group_id].push(t);
    }
  });

  return (
    <div
      className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden p-6 bg-slate-200/70 font-sans select-none flex justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Contenedor a Escala Arquitectónica Real (620px de ancho x 1050px de alto con Scroll Down) */}
      <div
        ref={containerRef}
        className="relative w-[620px] h-[1050px] min-h-[1050px] bg-slate-50 border-2 border-slate-300 rounded-3xl shadow-2xl overflow-hidden my-4"
        style={{
          // Contorno recortado idéntico al edificio:
          // Esquina inferior derecha: Chaflán diagonal del pasillo / escaleras sin piso (100% 64% -> 80% 86% -> 66% 100%)
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 64%, 82% 84%, 68% 100%, 0% 100%)',
          WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 64%, 82% 84%, 68% 100%, 0% 100%)'
        }}
      >
        {/* ========================================================== */}
        {/* ESTRUCTURA ARQUITECTÓNICA DEL PLANO (Z-INDEX 0)           */}
        {/* ========================================================== */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Zona Superior: Barra de Cocina / Servicio (h-[18%]) */}
          <div className="absolute top-0 left-0 w-full h-[18%] bg-slate-200/90 border-b-2 border-slate-300 flex flex-col justify-between p-2.5">
            {/* Renglón superior: Café, Plancha, Preparación */}
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase px-2">
              <span className="bg-white/60 px-2 py-0.5 rounded border border-slate-300/60">CAFÉ / REFRESCOS</span>
              <span className="bg-white/60 px-2 py-0.5 rounded border border-slate-300/60">PLANCHA & PREPARACIÓN</span>
              <span className="text-slate-400">FIN BARRA</span>
            </div>

            {/* Renglón inferior: Barra de Restaurante Entrega de Platillo */}
            <div className="bg-white/95 py-1 px-4 rounded-xl border border-slate-300 shadow-2xs text-center">
              <span className="text-[11px] font-black text-slate-800 tracking-wider uppercase block">
                BARRA DE RESTAURANTE ENTREGA DE PLATILLOS
              </span>
            </div>
          </div>

          {/* Zona Inferior Izquierda: Sillón en L de recepción */}
          <div className="absolute bottom-0 left-0 w-[24%] h-[20%]">
            {/* Mueble en L */}
            <div className="absolute bottom-0 left-0 w-full h-full bg-slate-200/80 border-t-2 border-r-2 border-slate-300 rounded-tr-2xl flex flex-col items-center justify-center p-1 text-center">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight block">
                RECEPCIÓN / CAJAS
              </span>
              <span className="text-[8px] text-slate-400">Mueble en L</span>
            </div>
          </div>

          {/* Acceso de Entrada y Salida (entre Sillón en L y el Chaflán Derecho) */}
          <div className="absolute bottom-0 left-[26%] w-[40%] h-[12%] flex flex-col items-center justify-center border-t-2 border-dashed border-emerald-400/90 bg-emerald-50/60 rounded-t-xl px-2">
            <span className="text-[10px] font-black text-emerald-800 tracking-wider uppercase">
              ↑ ENTRADA Y SALIDA DE COMENSALES ↓
            </span>
            <span className="text-[8px] text-emerald-600 font-semibold">
              Paso Libre a Salón
            </span>
          </div>

          {/* Cuadrícula sutil guía para el ojo */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* ========================================================== */}
        {/* LIENZO DE MESAS INTERACTIVAS (DRAG & DROP) (Z-INDEX 10)    */}
        {/* ========================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {/* 1. Mesas Dobles Fusionadas */}
          {Object.entries(groups).map(([groupId, groupTables]) => {
            if (groupTables.length < 2) return null;

            groupTables.forEach((t) => processedTableIds.add(t.id));

            const avgX = (groupTables[0].x + groupTables[1].x) / 2;
            const avgY = (groupTables[0].y + groupTables[1].y) / 2;
            const orientation = groupTables[0].orientation || 'horizontal';
            const status = groupTables[0].status || 'disponible';

            const syntheticDouble = {
              id: groupTables.map((t) => t.id).join('+'),
              x: avgX,
              y: avgY,
              orientation,
              status,
              group_id: groupId
            };

            return (
              <InteractiveTable
                key={groupId}
                table={syntheticDouble}
                isMergedDouble={true}
                mergedTables={groupTables}
                isSelected={groupTables.some((t) => selectedTableIds.includes(t.id))}
                onMouseDown={(e) => handleMouseDown(e, syntheticDouble)}
                onClick={() => onTableClick(groupTables[0])}
                onRotateOrientation={onRotateOrientation}
                onUnmerge={onUnmerge}
              />
            );
          })}

          {/* 2. Mesas Cuadradas Individuales */}
          {tables.map((table) => {
            if (processedTableIds.has(table.id)) return null;

            return (
              <InteractiveTable
                key={table.id}
                table={table}
                isMergedDouble={false}
                isSelected={selectedTableIds.includes(table.id) || nearTargetId === table.id}
                onMouseDown={(e) => handleMouseDown(e, table)}
                onClick={() => onTableClick(table)}
                onRotateOrientation={onRotateOrientation}
                onUnmerge={onUnmerge}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
