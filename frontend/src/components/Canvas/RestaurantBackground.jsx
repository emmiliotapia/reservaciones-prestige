import React from 'react';

/**
 * Componente exacto solicitado por el usuario:
 * - Define la estructura arquitectónica en modo claro con aspect-[3/4].
 * - Zona Superior: Café (arriba izq), Preparación/Plancha (arriba centro), Barra Entrega (top 16%).
 * - Zona Inferior: Cajas / Sillón en "L" (abajo izq), Escaleras / Salida rayada (abajo der).
 * - Área de mesas como children en la capa superior (z-10).
 */
const RestaurantBackground = ({ children }) => {
  return (
    /* Contenedor Principal: Define la proporción del plano y el fondo claro */
    <div className="relative w-full max-w-4xl mx-auto aspect-[3/4] bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans select-none">
      
      {/* --- ZONA SUPERIOR --- */}
      
      {/* Sección Café (Arriba Izquierda) */}
      <div className="absolute top-0 left-0 w-[25%] h-[8%] bg-white border-b border-r border-slate-200 rounded-br-lg flex items-center justify-center shadow-sm">
        <span className="text-xs font-semibold text-slate-400">CAFÉ</span>
      </div>

      {/* Sección Preparación / Plancha (Arriba Centro) */}
      <div className="absolute top-0 left-[30%] w-[45%] h-[12%] bg-white border-b border-x border-slate-200 rounded-b-lg flex flex-col items-center justify-center shadow-sm">
        <span className="text-[10px] font-semibold text-slate-400">PREPARACIÓN / PLANCHA</span>
      </div>

      {/* Barra de Entrega de Platillos */}
      <div className="absolute top-[16%] left-[10%] w-[70%] h-[6%] bg-white border border-slate-300 rounded-md flex items-center justify-center shadow-sm z-0">
        <span className="text-[10px] font-bold text-slate-500 tracking-wider">BARRA DE RESTAURANTE - ENTREGA</span>
      </div>


      {/* --- ZONA INFERIOR --- */}

      {/* Sección Cajas / Sillón en "L" (Abajo Izquierda) */}
      <div className="absolute bottom-[10%] left-[3%] w-[20%] h-[18%]">
        {/* Brazo Vertical de la L */}
        <div className="absolute bottom-0 right-0 w-[35%] h-full bg-white border border-slate-300 rounded-t-md shadow-sm"></div>
        {/* Brazo Horizontal de la L */}
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-white border border-slate-300 rounded-l-md shadow-sm flex items-center justify-center">
            <span className="text-[10px] font-semibold text-slate-400 -ml-4">CAJA</span>
        </div>
      </div>

      {/* Sección Escaleras / Salida (Abajo Derecha) */}
      <div className="absolute bottom-0 right-0 w-[45%] h-[18%] bg-white border-t border-l border-slate-300 rounded-tl-3xl shadow-sm overflow-hidden">
        {/* Fondo rayado simulando escalones usando Tailwind en línea */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 15%, #e2e8f0 15%, #e2e8f0 16%)' }}
        >
          {/* Capa borrosa para que el texto sea legible sobre los escalones */}
          <div className="w-full h-full bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-400">ESCALERAS / SALIDA</span>
          </div>
        </div>
      </div>

      {/* --- ÁREA DE MESAS (Renderizadas dinámicamente) --- */}
      {/* 
        El espacio entre top-[25%] y bottom-[30%] queda totalmente libre.
        Cualquier elemento pasado como 'children' (tus 18 mesas interactivas) 
        se renderizará por encima de esta estructura arquitectónica. 
      */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         <div className="pointer-events-auto w-full h-full relative">
            {children}
         </div>
      </div>

    </div>
  );
};

export default RestaurantBackground;
