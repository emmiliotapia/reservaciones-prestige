import React, { useState } from 'react';
import { X, Calendar, Plus, DollarSign, Check, History, Clock } from 'lucide-react';

/**
 * Modal para gestionar eventos mensuales, crear nuevos con fecha, hora, precio y cambiar el evento activo.
 */
export default function EventsModal({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onCreateEvent
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('500');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('20:00');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onCreateEvent({
      id: Date.now(),
      name: name.trim(),
      price_per_person: parseFloat(price),
      event_date: date,
      event_time: time
    });
    setName('');
    setPrice('500');
    setTime('20:00');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-slate-200/80 shadow-2xl relative font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Gestión de Eventos & Torneos
              </h3>
              <p className="text-xs text-slate-500">
                Registra nombre, precio por persona, fecha y hora del evento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario para registrar nuevo evento */}
        <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight block">
            + Registrar Nuevo Evento
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nombre del Evento</label>
              <input
                type="text"
                required
                placeholder="Ej. Noche de Casino VIP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cuota / Pax</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Día del Evento</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hora de Inicio</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar Evento</span>
            </button>
          </div>
        </form>

        {/* Lista de eventos pasados y activos */}
        <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight block">
            Eventos Disponibles
          </span>
          {events.map((ev) => {
            const isActive = ev.id === activeEventId;
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className={`
                  p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                  ${isActive ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400' : 'bg-white border-slate-200 hover:border-slate-300'}
                `}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{ev.name}</span>
                    {isActive && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 inline" /> {ev.event_date}
                    </span>
                    {ev.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 inline" /> {ev.event_time} hrs
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">
                    ${ev.price_per_person} MXN
                  </span>
                  <span className="text-[10px] text-slate-400">por persona</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
