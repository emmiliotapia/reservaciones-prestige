import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Minimize2,
  Maximize2,
  FileSpreadsheet,
  LogOut,
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
  ChevronDown,
  Lock,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { qzService } from '../services/qzService';
import EventsModal from './Modals/EventsModal';
import SalesReportModal from './Modals/SalesReportModal';

// NIP de Autorización del Gerente
const MANAGER_PIN = '2026';

// Lista de eventos iniciales
const INITIAL_EVENTS = [
  { id: 1, name: 'Noche de Casino VIP', price_per_person: 500, event_date: '2026-10-23', event_time: '20:00' },
  { id: 2, name: 'Torneo Texas Holdem Clásico', price_per_person: 750, event_date: '2026-10-30', event_time: '21:00' },
  { id: 3, name: 'Gala Fin de Año Casino', price_per_person: 1200, event_date: '2026-12-31', event_time: '22:00' },
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

export default function TableManager({ onLogout }) {
  const containerRef = useRef(null);

  // Sistema de Gestión de Eventos
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeEventId, setActiveEventId] = useState(1);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Formulario en el Panel Lateral
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [monto, setMonto] = useState(2000);
  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal de Autorización del Gerente (NIP 2026)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'release' | 'unmerge', id: string, name: string }

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



  // Drag End: calcula posición relativa al plano y si se arrastra sobre otra mesa disponible, las UNE automáticamente (Drag & Drop)
  const handleDragEnd = (event, info, table) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const targetEl = event.target?.closest('.cursor-grab') || event.target;
    if (!targetEl || !targetEl.getBoundingClientRect) return;

    const tableRect = targetEl.getBoundingClientRect();
    const tableCenterX = tableRect.left + tableRect.width / 2;
    const tableCenterY = tableRect.top + tableRect.height / 2;

    const rawX = ((tableCenterX - containerRect.left) / containerRect.width) * 100;
    const rawY = ((tableCenterY - containerRect.top) / containerRect.height) * 100;

    const newXPercent = Math.round(Math.max(5, Math.min(95, rawX)) * 10) / 10;
    const newYPercent = Math.round(Math.max(5, Math.min(95, rawY)) * 10) / 10;

    // Si es mesa individual disponible, verificar colisión con otra disponible para unirlas instantáneamente
    if (!table.group_id && table.status === 'disponible') {
      const targetTable = tables.find((other) => {
        if (other.id === table.id || other.group_id || other.status !== 'disponible') return false;
        const dist = Math.hypot(other.x - newXPercent, other.y - newYPercent);
        return dist < 9.0; // Umbral de proximidad de unión
      });

      if (targetTable) {
        const newGroupId = `grp-${Date.now()}`;
        const avgX = Math.round(((targetTable.x + newXPercent) / 2) * 10) / 10;
        const avgY = Math.round(((targetTable.y + newYPercent) / 2) * 10) / 10;

        setTables((prev) =>
          prev.map((t) =>
            t.id === table.id || t.id === targetTable.id
              ? { ...t, group_id: newGroupId, x: avgX, y: avgY, orientation: 'horizontal' }
              : t
          )
        );
        notify(`¡Mesas ${table.id} y ${targetTable.id} unidas con Drag & Drop en Mesa Doble (6 personas)!`, 'success');
        return;
      }
    }

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

  // Separar Mesa Doble directamente con 1 clic
  const requestUnmerge = (groupId) => {
    executeUnmerge(groupId);
  };

  // Solicitar autorización para Liberar / Limpiar Mesa
  const requestReleaseTable = (tableId) => {
    setPendingAction({
      type: 'release',
      id: tableId,
      title: `Liberar / Limpiar Mesa ${tableId}`
    });
    setPinInput('');
    setPinError(false);
    setIsPinModalOpen(true);
  };

  // Verificación del NIP del Gerente (2026)
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() !== MANAGER_PIN) {
      setPinError(true);
      notify('NIP de Gerente incorrecto. Autorización denegada.', 'error');
      return;
    }

    if (pendingAction?.type === 'release') {
      executeReleaseTable(pendingAction.id);
    } else if (pendingAction?.type === 'unmerge') {
      executeUnmerge(pendingAction.id);
    }

    setIsPinModalOpen(false);
    setPendingAction(null);
    setPinInput('');
    setPinError(false);
  };

  // Ejecución Autorizada: Dividir Mesa Doble
  const executeUnmerge = (groupId) => {
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
    notify('Mesa doble separada en 2 mesas individuales de 4 personas.', 'info');
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
        event_date: activeEvent.event_date,
        event_time: activeEvent.event_time,
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

  // Ejecución Autorizada: Liberar / Limpiar Mesa
  const executeReleaseTable = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId || (t.group_id && t.group_id === sidebarTable?.group_id)
          ? { ...t, status: 'disponible', group_id: null, customer_name: null, phone: null, total_paid: 0 }
          : t
      )
    );
    setIsSidebarOpen(false);
    setSidebarTable(null);
    notify(`Autorización de Gerente concedida: Mesa ${tableId} liberada y disponible`, 'success');
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
            <span>{isJoinMode ? 'Cancelar Unión' : 'Unir Mesas (o arrastra una sobre otra)'}</span>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all shadow-sm"
              title="Ver métricas de ventas y descargar reporte en Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Reporte de Ventas</span>
            </button>

            <button
              onClick={async () => {
                const testPayload = {
                  ticket_id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
                  customer_name: 'PRUEBA IMPRESIÓN',
                  phone: '000-000-0000',
                  party_size: 4,
                  total_paid: 2000,
                  event_name: activeEvent.name,
                  event_date: activeEvent.event_date,
                  event_time: activeEvent.event_time,
                  tables: ['M-TEST'],
                  printed_at: new Date().toLocaleTimeString()
                };
                notify('Enviando doble ticket con corte a la impresora...', 'info');
                await qzService.printDoubleTicket(testPayload);
                notify('¡Prueba enviada! (Copia Sala + Corte + Copia Cliente + Corte)', 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-all"
              title="Probar emisión de doble ticket con corte independiente"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Probar Impresión (2x)</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-all ml-1"
                title="Cerrar sesión de Marketing (mkt)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            )}
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

            const widthPercent = isHorizontal ? 18 : 9;
            const heightPercent = isHorizontal ? 7.2 : 14.4;

            return (
              <motion.div
                key={`${groupId}-${avgX}-${avgY}`}
                drag
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin={false}
                onDragEnd={(e, info) => handleDragEnd(e, info, syntheticDoubleTable)}
                onClick={() => handleTableClick(groupTables[0])}
                style={{
                  position: 'absolute',
                  left: `${avgX - widthPercent / 2}%`,
                  top: `${avgY - heightPercent / 2}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  x: 0,
                  y: 0
                }}
                className={`
                  cursor-grab active:cursor-grabbing rounded-lg border-2 transition-colors select-none
                  flex flex-col items-center justify-between p-1 z-20 group backdrop-blur-sm
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
                      requestUnmerge(groupId);
                    }}
                    className="p-1 rounded-full bg-white border border-slate-300 shadow-sm text-rose-600 hover:bg-rose-50 transition-all"
                    title="Dividir en 2 mesas de 4 personas (Requiere Autorización)"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Mesas Cuadradas Individuales (4 Personas: ancho 9%, alto calculado en píxeles/proporción) */}
          {tables.map((table) => {
            if (processedTableIds.has(table.id)) return null;
            const isSelected = selectedTableIds.includes(table.id);

            return (
              <motion.div
                key={`${table.id}-${table.x}-${table.y}`}
                drag
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                dragSnapToOrigin={false}
                onDragEnd={(e, info) => handleDragEnd(e, info, table)}
                onClick={() => handleTableClick(table)}
                style={{
                  position: 'absolute',
                  left: `${table.x - 4.5}%`,
                  top: `${table.y - 3.6}%`,
                  x: 0,
                  y: 0
                }}
                className={`
                  w-[9%] aspect-square flex flex-col items-center justify-between p-1 rounded-md
                  cursor-grab active:cursor-grabbing border-2 transition-colors select-none
                  z-10 backdrop-blur-sm
                  ${getStatusStyle(table.status)}
                  ${isSelected ? 'ring-4 ring-amber-400 scale-110 shadow-xl z-30' : 'hover:scale-105 shadow-sm'}
                `}
                title={`Mesa ${table.id} (${table.status}) - Clic para ver detalles / arrastra para mover`}
              >
                <div className="w-full flex items-center justify-between pointer-events-none leading-none">
                  <span className="font-extrabold text-[10px] text-slate-900 leading-none">{table.id}</span>
                  <span className="text-[8px] font-bold text-slate-500 leading-none">4p</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-tight opacity-80 pointer-events-none leading-none">
                  {table.status.slice(0, 4)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MENÚ DE INFORMACIÓN Y RESERVA EN EL LATERAL DERECHO        */}
      {/* ========================================================= */}
      {isSidebarOpen && sidebarTable && (
        <aside className={`fixed top-20 right-4 z-40 transition-all duration-300 rounded-2xl shadow-2xl border border-slate-200/90 font-sans backdrop-blur-md ${
          isSidebarMinimized 
            ? 'w-72 bg-white/95' 
            : 'w-80 sm:w-88 bg-white/98'
        }`}>
          {/* Header del Panel Compacto */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${sidebarTable.status === 'disponible' ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'}`}></span>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  {sidebarTable.group_id ? 'Mesa Doble' : 'Mesa'} {sidebarTable.id}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 capitalize leading-none">
                  <strong className={sidebarTable.status === 'disponible' ? 'text-emerald-700' : 'text-rose-700'}>{sidebarTable.status}</strong>
                  {' • '}{sidebarTable.group_id ? '6 pax' : '4 pax'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                title={isSidebarMinimized ? 'Expandir menú' : 'Minimizar menú para que no estorbe'}
              >
                {isSidebarMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setSidebarTable(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido Dinámico: Formulario para Disponible o Info Read-Only para Ocupada */}
          <div className={`p-4 overflow-y-auto max-h-[calc(100vh-10rem)] space-y-3 ${isSidebarMinimized ? "hidden" : "block"}`}>

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
                    <span>{isPrinting ? 'Imprimiendo 2 copias...' : 'Confirmar & Imprimir Doble Ticket (2x)'}</span>
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

                <div className="space-y-2 pt-2">
                  <button
                    onClick={async () => {
                      setIsPrinting(true);
                      try {
                        const ticketPayload = {
                          ticket_id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                          customer_name: sidebarTable.customer_name || 'Cliente en Sala',
                          phone: sidebarTable.phone || 'N/A',
                          party_size: sidebarTable.party_size || (sidebarTable.group_id ? 6 : 4),
                          total_paid: sidebarTable.total_paid || 2000,
                          event_name: activeEvent.name,
                          time_scheduled: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          tables: [sidebarTable.id],
                          printed_at: new Date().toLocaleTimeString()
                        };
                        await qzService.printDoubleTicket(ticketPayload);
                        notify('Doble ticket reimpreso (Copia Sala + Copia Cliente)', 'success');
                      } catch (err) {
                        notify(err.message, 'error');
                      } finally {
                        setIsPrinting(false);
                      }
                    }}
                    disabled={isPrinting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isPrinting ? 'Imprimiendo...' : 'Reimprimir Doble Ticket (2x)'}</span>
                  </button>

                  <button
                    onClick={() => requestReleaseTable(sidebarTable.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Liberar / Limpiar Mesa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* MODAL DE AUTORIZACIÓN DE GERENCIA (NIP 2026)             */}
      {/* ========================================================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white">Autorización del Gerente</h3>
                  <p className="text-[11px] text-slate-400">Acción protegida por seguridad</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPendingAction(null);
                  setPinInput('');
                  setPinError(false);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVerifyPin} className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Acción a autorizar</span>
                <p className="font-bold text-sm text-slate-800">{pendingAction?.title}</p>
                <p className="text-xs text-slate-500 pt-1">
                  Ingrese el código NIP maestro para confirmar esta operación:
                </p>
              </div>

              {/* NIP Input */}
              <div className="space-y-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  className={`w-full text-center tracking-[0.5em] text-2xl font-black rounded-2xl border py-3 px-4 focus:outline-none transition-all ${
                    pinError
                      ? 'border-rose-400 bg-rose-50/50 text-rose-600 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {pinError && (
                  <p className="text-[11px] text-rose-600 font-bold text-center animate-pulse">
                    NIP incorrecto. Ingrese el NIP de Gerente autorizado.
                  </p>
                )}
              </div>

              {/* Quick Numpad / Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPendingAction(null);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  Autorizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Completo de Gestión de Eventos */}
      <SalesReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeEvent={activeEvent}
        events={events}
        tables={tables}
      />

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
