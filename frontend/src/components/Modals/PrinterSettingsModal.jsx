import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Settings,
  HelpCircle,
  FileText,
  Zap,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { qzService } from '../../services/qzService';

export default function PrinterSettingsModal({ isOpen, onClose, onTestPrint }) {
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Cargar estado inicial y lista de impresoras
  const checkStatusAndPrinters = async (forceRefresh = false) => {
    setIsLoading(true);
    setStatusMsg('Buscando conexión con servicio POS...');
    try {
      const ready = await qzService.init(forceRefresh);
      setIsConnected(ready);
      if (ready) {
        const list = await qzService.getPrintersList();
        setPrinters(list);
        const saved = qzService.getSavedPrinter();
        if (saved && list.includes(saved)) {
          setSelectedPrinter(saved);
        } else if (list.length > 0) {
          const first = list[0];
          setSelectedPrinter(first);
          qzService.setPrinter(first);
        }
        setStatusMsg('Conexión establecida con éxito');
      } else {
        setStatusMsg('Servicio directo local (QZ Tray) no detectado.');
      }
    } catch (e) {
      setIsConnected(false);
      setStatusMsg('Error al verificar impresoras: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatusAndPrinters();
    }
  }, [isOpen]);

  const handleSelectPrinter = (e) => {
    const val = e.target.value;
    setSelectedPrinter(val);
    qzService.setPrinter(val);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      if (onTestPrint) {
        await onTestPrint();
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Configuración de Impresora Térmica POS
                </h3>
                <p className="text-xs text-slate-400">
                  Control de conexión directa y supresión de vista previa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="py-4 space-y-5 overflow-y-auto pr-1">
            {/* Estado de Conexión Directa */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isConnected 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
            }`}>
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isConnected ? 'Impresión Directa Activa (Sin vista previa)' : 'Modo Navegador Convencional (Con vista previa)'}
                  </span>
                  <button
                    onClick={() => checkStatusAndPrinters(true)}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Reconectar</span>
                  </button>
                </div>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                  {isConnected 
                    ? 'Conectado a QZ Tray en tu PC. Las órdenes se envían directamente a la impresora térmica con corte físico automático.' 
                    : 'QZ Tray no está corriendo localmente. El sistema recurre a la ventana de impresión del navegador.'}
                </p>
              </div>
            </div>

            {/* Selector de Impresora */}
            <div className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Impresora Térmica Asignada</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {printers.length > 0 ? `${printers.length} detectadas` : 'Predeterminada'}
                </span>
              </label>

              {isConnected && printers.length > 0 ? (
                <select
                  value={selectedPrinter}
                  onChange={handleSelectPrinter}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {printers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-900/80 px-3.5 py-2.5 rounded-xl border border-slate-800">
                  {selectedPrinter || 'Impresora Predeterminada del Sistema de Windows'}
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isTesting ? 'Imprimiendo...' : 'Probar Impresión (Doble Ticket + Corte)'}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Prueba copia sala + corte + cliente
                </span>
              </div>
            </div>

            {/* Guía: Cómo saltar completamente la vista previa */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>¿Cómo saltarse la vista previa para siempre? (2 Opciones)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Opción 1: Kiosk Mode */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Opción A: Modo Quiosco (Chrome)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    La forma más rápida sin programas extra. En el acceso directo de Google Chrome, añade la bandera:
                  </p>
                  <code className="block bg-black/60 px-2 py-1 rounded text-[10px] text-amber-300 font-mono select-all">
                    --kiosk-printing
                  </code>
                  <p className="text-[10px] text-slate-500">
                    Al presionar imprimir, saldrá instantáneamente en la impresora térmica predeterminada sin mostrar el diálogo.
                  </p>
                </div>

                {/* Opción 2: QZ Tray */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Opción B: Daemon QZ Tray</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Instala la aplicación gratuita <strong>QZ Tray</strong> en tu PC Windows para corte físico ESC/POS por hardware directo vía WebSocket.
                  </p>
                  <p className="text-[10px] text-indigo-300">
                    Una vez abierta en tu PC, el indicador de arriba cambiará automáticamente a verde.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Listo / Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
