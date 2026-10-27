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
   * Genera el HTML térmico formateado para impresión nativa del navegador (58mm / 80mm)
   */
  generateHtmlReceipt(ticket, isCustomerCopy = false) {
    const formattedTotal = Number(ticket.total_paid || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
    const tablesText = ticket.tables ? ticket.tables.join(' + ') : 'MESA';
    return `
      <div style="width: 280px; font-family: monospace; font-size: 12px; line-height: 1.4; color: #000; padding: 10px; margin: 0 auto; page-break-after: always; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 15px; font-weight: 900; letter-spacing: 1px;">CASINO & LOUNGE CLUB</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">${(ticket.event_name || 'EVENTO EXCLUSIVO').toUpperCase()}</p>
          <p style="margin: 2px 0 0 0; font-size: 10px;">FECHA: ${ticket.event_date || 'NOVIEMBRE 2026'}</p>
          <div style="margin-top: 6px; font-weight: bold; background: #000; color: #fff; padding: 2px 4px; display: inline-block; font-size: 10px;">
            ${isCustomerCopy ? '*** COMPROBANTE CLIENTE ***' : '*** COMPROBANTE DE SALA ***'}
          </div>
        </div>

        <div style="text-align: center; border: 1.5px solid #000; padding: 6px; margin: 8px 0; border-radius: 4px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase;">MESA(S) ASIGNADA(S)</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 2px;">&gt;&gt;&gt; ${tablesText} &lt;&lt;&lt;</div>
        </div>

        <div style="margin: 8px 0; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Folio:</span>
            <strong>${ticket.ticket_id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Titular:</span>
            <strong>${ticket.customer_name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Teléfono:</span>
            <span>${ticket.phone || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Comensales:</span>
            <strong>${ticket.party_size} Pax</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Cuota/Pax:</span>
            <span>$${ticket.price_per_person || 500} MXN</span>
          </div>
        </div>

        <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 6px 0; margin: 8px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 900;">
            <span>TOTAL:</span>
            <span>$${formattedTotal} MXN</span>
          </div>
          <div style="font-size: 10px; margin-top: 2px; text-align: right; font-weight: bold;">PAGO COMPLETO</div>
        </div>

        <div style="text-align: center; font-size: 10px; margin-top: 8px; color: #333;">
          <div>Presenta este comprobante al ingresar</div>
          <div>Emitido: ${ticket.printed_at || new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    `;
  }

  /**
   * Abre el diálogo de impresión nativo del navegador con 2 tickets (Copia Sala + Copia Cliente)
   */
  printBrowserTickets(ticketPayload) {
    return new Promise((resolve) => {
      const copySala = this.generateHtmlReceipt(ticketPayload, false);
      const copyCliente = this.generateHtmlReceipt(ticketPayload, true);

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const doc = printIframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tickets Reservación - ${ticketPayload.customer_name}</title>
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          ${copySala}
          ${copyCliente}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } catch (e) {
          console.error("Error abriendo diálogo de impresión:", e);
        }
        setTimeout(() => {
          document.body.removeChild(printIframe);
          resolve(true);
        }, 1500);
      }, 350);
    });
  }

  /**
   * Ejecución Silenciosa con doble impresión (Copia Local y Copia Cliente).
   * Si QZ Tray no está instalado o no se puede conectar, dispara automáticamente
   * la ventana de impresión nativa de tickets térmicos dobles para que el usuario NUNCA se quede sin ticket.
   */
  async printDoubleTicket(ticketPayload) {
    const isReady = await this.init();

    // Template 1: Copia Local
    const copyLocal = this.generateEscPosTemplate(ticketPayload, false);
    // Template 2: Copia Cliente
    const copyClient = this.generateEscPosTemplate(ticketPayload, true);

    if (!isReady || !this.connected) {
      console.warn("QZ Tray no detectado localmente. Usando motor de impresión directa del navegador...");
      await this.printBrowserTickets(ticketPayload);
      return {
        success: true,
        simulated: false,
        fallbackBrowser: true,
        message: "Doble ticket enviado a la impresora del sistema"
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
        message: "Doble ticket enviado silenciosamente a la impresora POS"
      };
    } catch (err) {
      console.warn("Fallo al imprimir via QZ Tray, recurriendo a diálogo directo del navegador:", err);
      await this.printBrowserTickets(ticketPayload);
      return {
        success: true,
        fallbackBrowser: true,
        message: "Doble ticket abierto en la impresora"
      };
    }
  }
}

export const qzService = new QZService();
