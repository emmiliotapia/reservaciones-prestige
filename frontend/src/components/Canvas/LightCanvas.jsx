import React from 'react';
import LightTable from './LightTable';

/**
 * Lienzo de Restaurante en Light Mode minimalista
 * - Contenedor principal con aspect-[4/5] escalable
 * - Capa 0: Estructura arquitectónica limpia (Cajas blancas estilizadas, bordes slate-200, sombras muy ligeras)
 *   - Zona Superior: Barra/Preparación (top-0, left-0, w-full, h-[15%])
 *   - Zona Inferior Izquierda: Cajas (L) (bottom-0, left-0, w-[25%], h-[25%])
 *   - Zona Inferior Derecha: Escaleras/Salida (polígono minimalista)
 * - Capa 1: Safe Area para las 18 mesas (top-[20%], bottom-[30%], left-0, right-[10%])
 * - Manejo de Fusión: Oculta los 2 cuadrados individuales y dibuja el rectángulo doble en el punto medio
 */
export default function LightCanvas({
  tables,
  selectedTableIds,
  onTableClick,
  onRotateOrientation,
  onUnmerge
}) {
  // Identificar grupos de mesas fusionadas
  const groups = {};
  const processedTableIds = new Set();

  tables.forEach((t) => {
    if (t.group_id) {
      if (!groups[t.group_id]) groups[t.group_id] = [];
      groups[t.group_id].push(t);
    }
  });

  return (
    <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-6 bg-slate-50">
      {/* Contenedor Principal con proporción fija aspect-[4/5] */}
      <div
        className="relative w-full max-w-xl aspect-[4/5] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-none"
      >
        {/* ======================================================== */}
        {/* CAPA 0: ESTRUCTURA ARQUITECTÓNICA MINIMALISTA (Z-INDEX 0) */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Zona Superior: Barra de Servicio / Preparación (h-[15%]) */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-slate-100/70 border-b border-slate-200 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Barra de Servicio & Preparación
            </span>
          </div>

          {/* Zona Inferior Izquierda: Cajas en L (w-[25%], h-[25%]) */}
          <div className="absolute bottom-0 left-0 w-[24%] h-[24%]">
            <div className="absolute inset-0 bg-slate-100/70 border-t border-r border-slate-200 rounded-tr-xl flex flex-col items-center justify-center p-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                Caja & Recepción
              </span>
            </div>
            {/* Elemento en L interior */}
            <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-white border-t border-r border-slate-200 rounded-tr-lg"></div>
          </div>

          {/* Zona Inferior Derecha: Escaleras / Salida (SVG minimalista limpio) */}
          <div className="absolute bottom-0 right-0 w-[28%] h-[24%] overflow-hidden">
            <svg className="w-full h-full text-slate-200" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="100,0 20,100 100,100" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
              {/* Escalones limpios */}
              <line x1="35" y1="100" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="50" y1="100" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="65" y1="100" x2="100" y2="60" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="80" y1="100" x2="100" y2="80" stroke="#e2e8f0" strokeWidth="1" />
              <text x="75" y="88" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">
                SALIDA
              </text>
            </svg>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CAPA 1: LIENZO DE MESAS (Z-INDEX 10)                     */}
        {/* ======================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {/* 1. Renderizar Mesas Dobles Fusionadas (Rectángulo único en el punto medio) */}
          {Object.entries(groups).map(([groupId, groupTables]) => {
            if (groupTables.length < 2) return null;

            // Marcar estas mesas como procesadas para no renderizarlas individuales
            groupTables.forEach((t) => processedTableIds.add(t.id));

            // Calcular punto medio exacto
            const avgX = (groupTables[0].x + groupTables[1].x) / 2;
            const avgY = (groupTables[0].y + groupTables[1].y) / 2;
            const orientation = groupTables[0].orientation || 'horizontal';
            const status = groupTables[0].status || 'disponible';

            const syntheticDoubleTable = {
              id: groupTables.map((t) => t.id).join('+'),
              x: avgX,
              y: avgY,
              orientation,
              status,
              group_id: groupId
            };

            const isSelected = groupTables.some((t) => selectedTableIds.includes(t.id));

            return (
              <LightTable
                key={groupId}
                table={syntheticDoubleTable}
                isMergedDouble={true}
                mergedTables={groupTables}
                isSelected={isSelected}
                onClick={() => onTableClick(groupTables[0])}
                onRotateOrientation={onRotateOrientation}
                onUnmerge={onUnmerge}
              />
            );
          })}

          {/* 2. Renderizar Mesas Cuadradas Individuales */}
          {tables.map((table) => {
            if (processedTableIds.has(table.id)) return null;

            return (
              <LightTable
                key={table.id}
                table={table}
                isMergedDouble={false}
                isSelected={selectedTableIds.includes(table.id)}
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
