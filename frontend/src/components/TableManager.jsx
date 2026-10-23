import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Printer,
  RotateCw,
  Unlink,
  Link2,
  X,
  Users,
  CheckCircle,
  Trash2,
  AlertCircle,
  Plus,
  History,
  Check,
  ChevronDown
} from 'lucide-react';
import { qzService } from '../services/qzService';
import EventsModal from './Modals/EventsModal';

// Lista de eventos iniciales
const INITIAL_EVENTS = [
  { id: 1, name: 'Noche de Casino VIP', price_per_person: 500, event_date: '2026-10-23' },
  { id: 2, name: 'Torneo Texas Holdem Clásico', price_per_person: 750, event_date: '2026-10-30' },
  { id: 3, name: 'Gala Fin de Año Casino', price_per_person: 1200, event_date: '2026-12-31' }
];

// 18 mesas distribuidas armónicamente en el área de piso libre
const INITIAL_TABLES = [
  // Fila 1 (Bajo barra de entrega)
  { id: 'M-1', x: 20, y: 34, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-2', x: 38, y: 34, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-3', x: 56, y: 34, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-4', x: 74, y: 34, status: 'disponible', orientation: 'horizontal', group_id: null },

  // Fila 2
  { id: 'M-5', x: 20, y: 46, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-6', x: 38, y: 46, status: 'reservada', customer_name: 'Ana Ramos', phone: '664 111 2233', total_paid: 2000, party_size: 4, orientation: 'horizontal', group_id: null },
  { id: 'M-7', x: 56, y: 46, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-8', x: 74, y: 46, status: 'disponible', orientation: 'horizontal', group_id: null },

  // Fila 3
  { id: 'M-9',  x: 20, y: 58, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-10', x: 38, y: 58, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-11', x: 56, y: 58, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-12', x: 74, y: 58, status: 'ocupada', customer_name: 'Carlos Mendoza', phone: '664 444 5566', total_paid: 2000, party_size: 4, orientation: 'horizontal', group_id: null },

  // Fila 4 (Evitando caja a la izquierda y escaleras a la derecha)
  { id: 'M-13', x: 38, y: 70, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-14', x: 56, y: 70, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-15', x: 72, y: 68, status: 'disponible', orientation: 'horizontal', group_id: null },

  // Fila 5 (Frente a escaleras y pasillo central)
  { id: 'M-16', x: 36, y: 80, status: 'disponible', orientation: 'horizontal', group_id: null },
  { id: 'M-17', x: 54, y: 80, status: 'reservada', customer_name: 'Sofía López', phone: '664 777 8899', total_paid: 2000, party_size: 4, orientation: 'horizontal', group_id: null },
  { id: 'M-18', x: 70, y: 78, status: 'disponible', orientation: 'horizontal', group_id: null }
];

export default function TableManager() {
  const containerRef = useRef(null);

  // Sistema de Gestión de Eventos
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeEventId, setActiveEventId] = useState(1);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);

  // Evento Activo Seleccionado
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const pricePerPerson = activeEvent?.price_per_person || 500;

  // Estado de Mesas
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [isJoinMode, setIsJoinMode] = useState(false);

  // Panel Lateral Derecho Único
  const [sidebarTable, setSidebarTable] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Formulario en el Panel Lateral
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [monto, setMonto] = useState(2000);
  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Recalcular monto automáticamente cuando cambian los comensales o el evento
  useEffect(() => {
    if (sidebarTable && sidebarTable.status === 'disponible') {
      setMonto(partySize * pricePerPerson);
    }
  }, [partySize, pricePerPerson, sidebarTable]);

  // Selección de Evento
  const handleSelectEvent = (id) => {
    setActiveEventId(id);
    const ev = events.find((e) => e.id === id);
    if (ev) {
      notify(`Evento activo: ${ev.name} ($${ev.price_per_person}/persona)`, 'info');
    }
    setIsEventsModalOpen(false);
  };

  // Crear Nuevo Evento
  const handleCreateEvent = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    notify(`Nuevo evento creado: ${newEvent.name}`, 'success');
  };

  // Mesa objetivo cercana para fusión magnética
  const [magneticTargetId, setMagneticTargetId] = useState(null);
  const MERGE_PROXIMITY_THRESHOLD = 8; // Distancia porcentual de solapamiento para unir mesas

  // Detección en tiempo real durante el arrastre (OnDrag)
  const handleDrag = (event, info, table) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = (info.offset.x / rect.width) * 100;
    const deltaYPercent = (info.offset.y / rect.height) * 100;
    const currentX = Math.max(5, Math.min(95, table.x + deltaXPercent));
    const currentY = Math.max(5, Math.min(95, table.y + deltaYPercent));

    // Solo mesas disponibles e individuales pueden auto-fusionarse
    if (table.group_id || table.status !== 'disponible') {
      setMagneticTargetId(null);
      return;
    }

    let closest = null;
    let minD = Infinity;

    tables.forEach((other) => {
      if (other.id !== table.id && !other.group_id && other.status === 'disponible') {
        const dx = (other.x - currentX) * 0.8;
        const dy = other.y - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MERGE_PROXIMITY_THRESHOLD && dist < minD) {
          minD = dist;
          closest = other.id;
        }
      }
    });

    setMagneticTargetId(closest);
  };

  // Drag End: coloca la mesa exactamente en el centro donde ves el cuadro en pantalla
  const handleDragEnd = (event, info, table) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Obtener el centro visual real del cuadro que se está arrastrando en la pantalla
    let targetCenterX = info.point.x;
    let targetCenterY = info.point.y;

    // Si el elemento arrastrado tiene getBoundingClientRect en el DOM, usamos su centro físico exacto
    const targetEl = event.target?.closest('.cursor-grab') || event.target;
    if (targetEl && targetEl.getBoundingClientRect) {
      const elRect = targetEl.getBoundingClientRect();
      targetCenterX = elRect.left + elRect.width / 2;
      targetCenterY = elRect.top + elRect.height / 2;
    }

    const rawX = ((targetCenterX - containerRect.left) / containerRect.width) * 100;
    const rawY = ((targetCenterY - containerRect.top) / containerRect.height) * 100;

    // Limitar suavemente dentro de los bordes del plano (4% a 96%)
    const newXPercent = Math.round(Math.max(4, Math.min(96, rawX)) * 10) / 10;
    const newYPercent = Math.round(Math.max(4, Math.min(96, rawY)) * 10) / 10;

    // Verificar si se soltó directamente sobre otra mesa disponible para FUSIÓN
    if (!table.group_id && table.status === 'disponible') {
      let targetTable = null;
      let minDistance = Infinity;

      tables.forEach((other) => {
        if (other.id !== table.id && !other.group_id && other.status === 'disponible') {
          const dx = (other.x - newXPercent) * 0.8;
          const dy = other.y - newYPercent;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MERGE_PROXIMITY_THRESHOLD && dist < minDistance) {
            minDistance = dist;
            targetTable = other;
          }
        }
      });

      if (targetTable) {
        // Fusión: la mesa doble toma la posición de la mesa objetivo
        const newGroupId = `grp-${Date.now()}`;
        const finalX = targetTable.x;
        const finalY = targetTable.y;

        setTables((prev) =>
          prev.map((t) =>
            t.id === table.id || t.id === targetTable.id
              ? { ...t, group_id: newGroupId, x: finalX, y: finalY, orientation: 'horizontal' }
              : t
          )
        );

        setMagneticTargetId(null);
        notify(`¡Mesas ${table.id} y ${targetTable.id} unidas! Mesa Doble creada`, 'success');
        return;
      }
    }

    setMagneticTargetId(null);

    // Guardar exactamente en la posición donde ves el cuadro
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === table.id) {
          return { ...t, x: newXPercent, y: newYPercent };
        }
        if (table.group_id && t.group_id === table.group_id) {
          return { ...t, x: newXPercent, y: newYPercent };
        }
        return t;
      })
    );
  };

  // Clic en Mesa: Si está en modo juntar, selecciona; si no, abre el Menú Lateral Derecho
  const handleTableClick = (table) => {
    if (isJoinMode) {
      if (table.status !== 'disponible') {
        notify('Solo puedes juntar mesas disponibles', 'warning');
        return;
      }
      setSelectedTableIds((prev) => {
        if (prev.includes(table.id)) {
          return prev.filter((id) => id !== table.id);
        }
        if (prev.length >= 2) {
          notify('Solo puedes unir 2 mesas a la vez', 'warning');
          return [prev[1], table.id];
        }
        return [...prev, table.id];
      });
      return;
    }

    // Modo normal: Abre directamente el panel derecho
    setSidebarTable(table);
    setIsSidebarOpen(true);

    const defaultCapacity = table.group_id ? 6 : 4;
    if (table.status === 'disponible') {
      setCustomerName('');
      setPhone('');
      setPartySize(defaultCapacity);
      setMonto(defaultCapacity * pricePerPerson);
    } else {
      setCustomerName(table.customer_name || '');
      setPhone(table.phone || '');
      setPartySize(table.party_size || defaultCapacity);
      setMonto(table.total_paid || defaultCapacity * pricePerPerson);
    }
  };

  // Juntar 2 Mesas en una Mesa Doble (6 personas)
  const handleMergeTables = () => {
    if (selectedTableIds.length !== 2) {
      notify('Por favor selecciona 2 mesas en el mapa', 'warning');
      return;
    }
    const [id1, id2] = selectedTableIds;
    const t1 = tables.find((t) => t.id === id1);
    const t2 = tables.find((t) => t.id === id2);
    if (!t1 || !t2) return;

    const newGroupId = `grp-${Date.now()}`;
    const avgX = (t1.x + t2.x) / 2;
    const avgY = (t1.y + t2.y) / 2;

    setTables((prev) =>
      prev.map((t) =>
        t.id === id1 || t.id === id2
          ? { ...t, group_id: newGroupId, x: avgX, y: avgY, orientation: 'horizontal' }
          : t
      )
    );

    setSelectedTableIds([]);
    setIsJoinMode(false);
    notify(`¡Mesas ${id1} y ${id2} unidas en Mesa Doble (Capacidad: 6 personas)!`, 'success');
  };

  // Rotar Orientación (Horizontal <-> Vertical)
  const handleRotateOrientation = (groupId) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.group_id === groupId) {
          return { ...t, orientation: t.orientation === 'horizontal' ? 'vertical' : 'horizontal' };
        }
        return t;
      })
    );
    notify('Orientación de mesa doble rotada', 'info');
  };

  // Dividir Mesa Doble
  const handleUnmerge = (groupId) => {
    setTables((prev) => {
      const merged = prev.filter((t) => t.group_id === groupId);
      if (merged.length < 2) return prev;
      const baseX = merged[0].x;
      const baseY = merged[0].y;

      return prev.map((t) => {
        if (t.group_id === groupId) {
          const isFirst = t.id === merged[0].id;
          return {
            ...t,
            group_id: null,
            orientation: 'horizontal',
            x: isFirst ? Math.max(12, baseX - 6) : Math.min(88, baseX + 6),
            y: baseY
          };
        }
        return t;
      });
    });
    notify('Mesa doble dividida en 2 mesas individuales de 4 personas', 'info');
  };

  // Guardar Reserva desde el Panel Lateral Derecho
  const handleSaveReservation = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !sidebarTable) return;

    setIsPrinting(true);
    try {
      const tableId = sidebarTable.id;
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId || (t.group_id && t.group_id === sidebarTable.group_id)
            ? {
                ...t,
                status: 'ocupada',
                customer_name: customerName.trim(),
                phone: phone.trim(),
                party_size: partySize,
                total_paid: Number(monto)
              }
            : t
        )
      );

      const ticketPayload = {
        ticket_id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        party_size: partySize,
        total_paid: Number(monto),
        event_name: activeEvent.name,
        time_scheduled: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tables: [tableId],
        printed_at: new Date().toLocaleTimeString()
      };

      await qzService.printDoubleTicket(ticketPayload);
      notify(`Reservación guardada para ${customerName}. Doble ticket emitido.`, 'success');

      setIsSidebarOpen(false);
      setSidebarTable(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  // Liberar Mesa desde el Panel Lateral
  const handleReleaseTable = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId || (t.group_id && t.group_id === sidebarTable?.group_id)
          ? { ...t, status: 'disponible', group_id: null, customer_name: null, phone: null, total_paid: 0 }
          : t
      )
    );
    setIsSidebarOpen(false);
    setSidebarTable(null);
    notify(`Mesa ${tableId} liberada y disponible`, 'success');
  };

  // Agrupamiento
  const groups = {};
  const processedTableIds = new Set();
  tables.forEach((t) => {
    if (t.group_id) {
      if (!groups[t.group_id]) groups[t.group_id] = [];
      groups[t.group_id].push(t);
    }
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'disponible':
        return 'bg-emerald-100/90 text-emerald-900 border-emerald-400 hover:border-emerald-500 shadow-sm';
      case 'reservada':
        return 'bg-blue-100/90 text-blue-900 border-blue-400 hover:border-blue-500 shadow-sm';
      case 'ocupada':
      default:
        return 'bg-rose-100/90 text-rose-900 border-rose-400 hover:border-rose-500 shadow-sm';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* ========================================================= */}
      {/* HEADER SUPERIOR: EVENTO ACTIVO, HISTORIAL Y ACCIONES      */}
      {/* ========================================================= */}
      <header className="h-16 bg-slate-950/95 border-b border-slate-800 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-md">
            POS
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
              Casino Floor Manager
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                18 Mesas
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Plano a Escala & Control de Reservaciones
            </p>
          </div>
        </div>

        {/* Event Context Header & Modal Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEventsModalOpen(true)}
            className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-2xl px-3.5 py-1.5 shadow-sm transition-all text-left group"
            title="Clic para cambiar de evento o crear uno nuevo"
          >
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">{activeEvent.name}</span>
                <span className="text-[10px] text-slate-500">({activeEvent.event_date})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <span>${activeEvent.price_per_person} MXN</span>
                <span className="text-[10px] text-slate-400 font-normal">/ comensal</span>
              </div>
            </div>
          </button>
        </div>

        {/* Acciones: Juntar Mesas y QZ Tray */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Botón de Modo Juntar Mesas */}
          <button
            onClick={() => {
              if (isJoinMode) {
                setIsJoinMode(false);
                setSelectedTableIds([]);
              } else {
                setIsJoinMode(true);
                notify('Modo unir mesas activado: selecciona 2 mesas disponibles en el plano', 'info');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              isJoinMode
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>{isJoinMode ? 'Cancelar Unión' : 'Unir 2 Mesas'}</span>
          </button>

          {/* Confirmar Fusión cuando hay 2 seleccionadas */}
          {selectedTableIds.length === 2 && (
            <button
              onClick={handleMergeTables}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-500 transition-all animate-bounce"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Mesa Doble ({selectedTableIds.join(' + ')})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>QZ Tray Silencioso</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* ÁREA PRINCIPAL: PLANO AMPLIO EN PANTALLA COMPLETA         */}
      {/* ========================================================= */}
      <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden p-6 bg-slate-950/70">
        {/* CONTENEDOR PRINCIPAL AMPLIO: Abarca el ancho de la pantalla y permite scroll natural hacia abajo */}
        <div
          ref={containerRef}
          className="relative w-[95%] max-w-5xl mx-auto aspect-[4/5] bg-[url('/layout-restaurante.png')] bg-[length:100%_100%] bg-no-repeat shadow-xl rounded-xl border border-slate-300 mb-12 select-none bg-white"
        >
          {/* ========================================================= */}
          {/* 18 MESAS INTERACTIVAS (FRAMER-MOTION DRAG)                */}
          {/* ========================================================= */}

          {/* Mesas Dobles Fusionadas (6 Personas) */}
          {Object.entries(groups).map(([groupId, groupTables]) => {
            if (groupTables.length < 2) return null;
            groupTables.forEach((t) => processedTableIds.add(t.id));

            const avgX = (groupTables[0].x + groupTables[1].x) / 2;
            const avgY = (groupTables[0].y + groupTables[1].y) / 2;
            const orientation = groupTables[0].orientation || 'horizontal';
            const status = groupTables[0].status || 'disponible';
            const isHorizontal = orientation === 'horizontal';
            const labels = groupTables.map((t) => t.id).join(' + ');

            const syntheticDoubleTable = {
              id: labels,
              x: avgX,
              y: avgY,
              status,
              group_id: groupId,
              orientation,
              party_size: groupTables[0].party_size || 6,
              total_paid: groupTables[0].total_paid,
              customer_name: groupTables[0].customer_name,
              phone: groupTables[0].phone
            };

            return (
              <motion.div
                key={`${groupId}-${avgX}-${avgY}-${orientation}`}
                drag
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin={false}
                onDragEnd={(e, info) => handleDragEnd(e, info, syntheticDoubleTable)}
                onClick={() => handleTableClick(groupTables[0])}
                style={{
                  position: 'absolute',
                  left: `${avgX}%`,
                  top: `${avgY}%`,
                  width: isHorizontal ? '18%' : '9%',
                  height: isHorizontal ? '7.2%' : '14.4%'
                }}
                className={`
                  cursor-grab active:cursor-grabbing rounded-lg border-2 transition-colors
                  flex flex-col items-center justify-between p-1 z-20 group backdrop-blur-sm
                  transform -translate-x-1/2 -translate-y-1/2
                  ${getStatusStyle(status)}
                `}
                title={`Mesa Doble (${labels}) - Capacidad 6 personas. Clic para ver en el panel derecho`}
              >
                <div className="w-full flex items-center justify-between text-[9px] font-black uppercase pointer-events-none leading-none">
                  <span>DOBLE</span>
                  <span className="flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5 inline" /> 6p
                  </span>
                </div>

                <span className="font-extrabold text-[11px] text-slate-900 pointer-events-none leading-none">
                  {labels}
                </span>

                <span className="text-[9px] font-extrabold uppercase tracking-tight opacity-80 pointer-events-none leading-none">
                  {status.slice(0, 4)}
                </span>

                {/* Controles de Rotación y División */}
                <div className="absolute -top-3.5 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRotateOrientation(groupId);
                    }}
                    className="p-1 rounded-full bg-white border border-slate-300 shadow-sm text-slate-700 hover:bg-slate-50 transition-all"
                    title="Rotar horizontal / vertical"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmerge(groupId);
                    }}
                    className="p-1 rounded-full bg-white border border-slate-300 shadow-sm text-rose-600 hover:bg-rose-50 transition-all"
                    title="Dividir en 2 mesas de 4 personas"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Mesas Cuadradas Individuales (4 Personas) */}
          {tables.map((table) => {
            if (processedTableIds.has(table.id)) return null;
            const isSelected = selectedTableIds.includes(table.id);
            const isMagneticTarget = magneticTargetId === table.id;

            return (
              <motion.div
                key={`${table.id}-${table.x}-${table.y}`}
                drag
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin={false}
                onDrag={(e, info) => handleDrag(e, info, table)}
                onDragEnd={(e, info) => handleDragEnd(e, info, table)}
                onClick={() => handleTableClick(table)}
                style={{
                  position: 'absolute',
                  left: `${table.x}%`,
                  top: `${table.y}%`
                }}
                className={`
                  absolute w-[9%] aspect-square flex flex-col items-center justify-between p-1 rounded-md
                  transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing border-2 transition-all
                  z-10 backdrop-blur-sm
                  ${getStatusStyle(table.status)}
                  ${isMagneticTarget ? 'ring-4 ring-indigo-500 scale-110 shadow-2xl z-40 animate-pulse bg-indigo-100 border-indigo-400' : ''}
                  ${isSelected ? 'ring-4 ring-amber-400 scale-110 shadow-xl z-30' : 'hover:scale-105 shadow-sm'}
                `}
                title={`${table.id} (${table.status}) - Arrastra sobre otra mesa para unir en mesa doble`}
              >
                <div className="w-full flex items-center justify-between pointer-events-none leading-none">
                  <span className="font-extrabold text-[10px] text-slate-900 leading-none">{table.id}</span>
                  <span className="text-[8px] font-bold text-slate-500 leading-none">4p</span>
                </div>
                {isMagneticTarget ? (
                  <span className="text-[7px] font-black uppercase text-indigo-700 bg-indigo-200/90 px-0.5 rounded animate-bounce pointer-events-none leading-none">
                    ¡Soltar!
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold uppercase tracking-tight opacity-80 pointer-events-none leading-none">
                    {table.status.slice(0, 4)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MENÚ DE INFORMACIÓN Y RESERVA EN EL LATERAL DERECHO        */}
      {/* ========================================================= */}
      {isSidebarOpen && sidebarTable && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white text-slate-800 border-l border-slate-200 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-200">
          {/* Header del Panel */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${sidebarTable.status === 'disponible' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {sidebarTable.group_id ? 'Mesa Doble' : 'Mesa'} {sidebarTable.id}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 capitalize block mt-0.5">
                Estado Actual: <strong className={sidebarTable.status === 'disponible' ? 'text-emerald-700' : 'text-rose-700'}>{sidebarTable.status}</strong>
                {' • '}Capacidad: <strong>{sidebarTable.group_id ? '6' : '4'} comensales</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setSidebarTable(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido Dinámico: Formulario para Disponible o Info Read-Only para Ocupada */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {sidebarTable.status === 'disponible' ? (
              /* FORMULARIO DE CAPTURA RÁPIDA (EN EL LATERAL DERECHO) */
              <form onSubmit={handleSaveReservation} className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                    {activeEvent.name} • (${pricePerPerson} MXN / persona)
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-indigo-950">
                        ${monto} MXN
                      </span>
                      <span className="text-[11px] text-slate-500 block font-medium">
                        {partySize} comensales x ${pricePerPerson}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Pago Completo
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Titular</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Roberto Albarrán"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="664 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Comensales ({sidebarTable.group_id ? 'Mesa Doble hasta 6p' : 'Mesa Individual hasta 4p'})
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Array.from({ length: sidebarTable.group_id ? 6 : 4 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Persona' : 'Personas'} (${n * pricePerPerson} MXN)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isPrinting}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isPrinting ? 'Imprimiendo...' : 'Confirmar & Imprimir [Enter]'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* DETALLE DE SOLO LECTURA (PARA MESAS OCUPADAS) */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Titular</span>
                    <span className="font-bold text-slate-800">{sidebarTable.customer_name || 'Cliente en Sala'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Teléfono</span>
                    <span className="font-mono text-slate-700">{sidebarTable.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Comensales</span>
                    <span className="font-bold text-slate-800">{sidebarTable.party_size || (sidebarTable.group_id ? 6 : 4)} personas</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-400 font-medium">Total Cobrado</span>
                    <span className="text-sm font-black text-emerald-600">${sidebarTable.total_paid || 2000} MXN</span>
                  </div>
                </div>

                <button
                  onClick={() => handleReleaseTable(sidebarTable.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Liberar / Limpiar Mesa</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Modal Completo de Gestión de Eventos */}
      <EventsModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        events={events}
        activeEventId={activeEventId}
        onSelectEvent={handleSelectEvent}
        onCreateEvent={handleCreateEvent}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
