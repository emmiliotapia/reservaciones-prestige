# Especificaciones de Impresión Térmica
**Flujo de Comunicación:**
* El cliente web en React inicializará una conexión mediante `qz-tray` hacia `ws://localhost:8182` (equipo Windows local).
* El payload debe construirse utilizando comandos ESC/POS puros (texto, salto de línea, corte de papel) para evitar renderizados lentos de HTML.

**Regla de Doble Impresión:**
* Al confirmar la reserva o corte de cuenta, la función de React debe hacer un bucle para enviar el trabajo a la cola de impresión exactamente dos veces (Copia Negocio y Copia Cliente).
* Implementar manejo de promesas para capturar y notificar en la interfaz (toast neon green) si la impresora local no responde.
