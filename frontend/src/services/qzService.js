/**
 * Servicio de Impresión Térmica QZ Tray
 * Comunicación por WebSocket directo con el daemon local (ws://localhost:8182).
 * Ejecución silenciosa y comando doble para copia local + copia cliente.
 */

class QZService {
  constructor() {
    this.connected = false;
    this.qz = null;
    this.printerName = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const qzModule = await import('qz-tray');
        this.qz = qzModule.default || qzModule;

        // Configuración de certificados o firmas en blanco para entornos locales
        this.qz.security.setCertificatePromise(() => Promise.resolve(""));
        this.qz.security.setSignaturePromise(() => Promise.resolve(""));

        if (!this.qz.websocket.isActive()) {
          await this.qz.websocket.connect({
            host: 'localhost',
            usingSecure: false,
            port: {
              secure: [8283, 8284],
              insecure: [8182, 8183]
            },
            keepAlive: 60
          });
        }

        this.connected = true;
        console.log("QZ Tray conectado exitosamente via ws://localhost:8182");

        // Intentar detectar impresora predeterminada
        try {
          this.printerName = await this.qz.printers.getDefault();
        } catch {
          this.printerName = "Generic / Text Only";
        }

        return true;
      } catch (err) {
        console.warn("QZ Tray no está en ejecución local en ws://localhost:8182:", err.message);
        this.connected = false;
        return false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Genera el payload de comandos ESC/POS para impresora térmica (58mm / 80mm).
   * Diseño moderno, limpio, minimalista y profesional.
   */
  generateEscPosTemplate(ticket, isCustomerCopy = false) {
    const ESC = '\x1B';
    const GS = '\x1D';

    let cmd = '';
    cmd += ESC + '@'; // Reset
    cmd += ESC + 'a' + '\x01'; // Centrado

    // Logotipo / Título Principal
    cmd += ESC + 'E' + '\x01'; // Bold ON
    cmd += '================================\n';
    cmd += '      CASINO & LOUNGE CLUB      \n';
    cmd += '================================\n';
    cmd += ESC + 'E' + '\x00'; // Bold OFF

    // Subtítulo elegante y tipo de ticket
    cmd += ESC + 'M' + '\x01'; // Fuente estilizada
    cmd += (ticket.event_name ? ticket.event_name.toUpperCase() : 'EVENTO EXCLUSIVO') + '\n';
    cmd += 'FECHA DEL EVENTO: ' + (ticket.event_date || 'NOVIEMBRE 2026') + '\n';
    cmd += '--------------------------------\n';
    cmd += isCustomerCopy ? '     * COMPROBANTE CLIENTE *    \n' : '     * COMPROBANTE DE SALA *    \n';
    cmd += '--------------------------------\n';

    // Bloque de Mesa(s) destacado
    cmd += ESC + 'a' + '\x01';
    cmd += ESC + 'E' + '\x01';
    cmd += 'MESA(S) ASIGNADA(S):\n';
    cmd += '>>>  ' + (ticket.tables ? ticket.tables.join(' + ') : 'MESA') + '  <<<\n';
    cmd += ESC + 'E' + '\x00';
    cmd += '--------------------------------\n';

    // Datos del Titular y Detalle Económico (alineación izquierda)
    cmd += ESC + 'a' + '\x00';
    cmd += `Folio:       ${ticket.ticket_id}\n`;
    cmd += `Titular:     ${ticket.customer_name}\n`;
    cmd += `Telefono:    ${ticket.phone}\n`;
    cmd += `Comensales:  ${ticket.party_size} Personas (Pax)\n`;
    cmd += `Cuota/Pax:   $${ticket.price_per_person || 500} MXN\n`;
    cmd += '--------------------------------\n';

    // Total Cobrado con énfasis
    cmd += ESC + 'E' + '\x01';
    cmd += `TOTAL PAGADO:  $${Number(ticket.total_paid || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n`;
    cmd += ESC + 'E' + '\x00';
    cmd += 'ESTADO:        PAGO COMPLETO\n';
    cmd += '--------------------------------\n';

    // Pie de página profesional
    cmd += ESC + 'a' + '\x01';
    cmd += 'Presenta este comprobante en la\n';
    cmd += 'entrada de recepcion al llegar.\n';
    cmd += `Emitido: ${ticket.printed_at || new Date().toLocaleTimeString()}\n\n`;

    // Avance de papel y corte limpio
    cmd += '\n\n\n';
    cmd += GS + 'V' + '\x41' + '\x00'; // Corte automático

    return cmd;
  }

  /**
   * Ejecución Silenciosa con doble impresión (Copia Local y Copia Cliente)
   */
  async printDoubleTicket(ticketPayload) {
    const isReady = await this.init();

    // Template 1: Copia Local
    const copyLocal = this.generateEscPosTemplate(ticketPayload, false);
    // Template 2: Copia Cliente
    const copyClient = this.generateEscPosTemplate(ticketPayload, true);

    if (!isReady || !this.connected) {
      console.warn("Simulación de impresión térmica (QZ Tray no detectado localmente):");
      console.log("%c[TICKET 1 - LOCAL]", "color: #00FF66; font-weight: bold;");
      console.log(copyLocal);
      console.log("%c[TICKET 2 - CLIENTE]", "color: #00FF66; font-weight: bold;");
      console.log(copyClient);
      return {
        success: true,
        simulated: true,
        message: "Impresión simulada en consola (QZ Tray no activo en ws://localhost:8182)"
      };
    }

    try {
      const config = this.qz.configs.create(this.printerName || "POS-Printer", {
        encoding: 'ISO-8859-1',
        altPrinting: true
      });

      // Disparo 1: Copia Local
      await this.qz.print(config, [{ type: 'raw', format: 'command', flavor: 'plain', data: copyLocal }]);
      
      // Breve pausa milimétrica para búfer de cabezal térmico
      await new Promise(r => setTimeout(r, 200));

      // Disparo 2: Copia Cliente
      await this.qz.print(config, [{ type: 'raw', format: 'command', flavor: 'plain', data: copyClient }]);

      return {
        success: true,
        simulated: false,
        message: "Doble ticket enviado silenciosamente a la cola de Windows"
      };
    } catch (err) {
      console.error("Fallo al imprimir via QZ Tray:", err);
      return {
        success: false,
        simulated: false,
        error: err.message
      };
    }
  }
}

export const qzService = new QZService();
