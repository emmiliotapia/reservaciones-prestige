import React from 'react';

/**
 * Renderiza polígonos/envolturas SVG dinámicas con resplandor neón
 * para agrupar visualmente todas las mesas que comparten un group_id.
 */
export default function GroupGlowOverlay({ tables }) {
  // Agrupar mesas por group_id
  const groups = {};
  tables.forEach((t) => {
    if (t.group_id) {
      if (!groups[t.group_id]) groups[t.group_id] = [];
      groups[t.group_id].push(t);
    }
  });

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
      <defs>
        <filter id="neon-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="group-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FF66" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#00FF66" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {Object.entries(groups).map(([groupId, groupTables]) => {
        if (groupTables.length < 2) {
          const t = groupTables[0];
          return (
            <circle
              key={groupId}
              cx={t.pos_x + 34}
              cy={t.pos_y + 34}
              r={45}
              fill="url(#group-gradient)"
              stroke="#00FF66"
              strokeWidth="2"
              strokeDasharray="4 4"
              filter="url(#neon-glow-filter)"
              className="animate-pulse"
            />
          );
        }

        // Bounding de las mesas fusionadas
        const minX = Math.min(...groupTables.map((t) => t.pos_x)) - 10;
        const maxX = Math.max(...groupTables.map((t) => t.pos_x + 68)) + 10;
        const minY = Math.min(...groupTables.map((t) => t.pos_y)) - 10;
        const maxY = Math.max(...groupTables.map((t) => t.pos_y + 68)) + 10;
        const width = maxX - minX;
        const height = maxY - minY;

        return (
          <g key={groupId}>
            {/* Contenedor envolvente neón */}
            <rect
              x={minX}
              y={minY}
              width={width}
              height={height}
              rx={18}
              fill="url(#group-gradient)"
              stroke="#00FF66"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              filter="url(#neon-glow-filter)"
            />
            {/* Líneas de conexión */}
            {groupTables.map((t, idx) => {
              if (idx === 0) return null;
              const prev = groupTables[idx - 1];
              return (
                <line
                  key={`${t.id}-${prev.id}`}
                  x1={prev.pos_x + 34}
                  y1={prev.pos_y + 34}
                  x2={t.pos_x + 34}
                  y2={t.pos_y + 34}
                  stroke="#00FF66"
                  strokeWidth="3.5"
                  strokeOpacity="0.85"
                />
              );
            })}
            <text
              x={minX + 10}
              y={minY + 14}
              fill="#00FF66"
              fontSize="9"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
              letterSpacing="1"
            >
              MESA DOBLE
            </text>
          </g>
        );
      })}
    </svg>
  );
}
