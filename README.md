# Casino Prestige - Sistema de Gestión de Reservaciones & POS

Sistema integral de gestión de reservas, punto de venta (POS) y mapeo interactivo de mesas con plano arquitectónico a escala real, autorización de gerencia (NIP), reporte de ventas exportable a Excel/CSV e impresión térmica silenciosa dual (QZ Tray ESC/POS).

---

## 🏛️ Características Principales

### 1. Mapeo Interactivo de Mesas sobre Plano Arquitectónico Real
* **Plano arquitectónico auténtico:** Basado en el plano de sala real (`layout-restaurante.png`), escalado de forma proporcional y limpia con `aspect-[4/5]`, adaptado al ancho de pantalla con desplazamiento vertical fluido (`overflow-y-auto`).
* **Arrastre Libre de Mesas (Drag & Drop):** Posicionamiento libre y milimétrico con Framer Motion persistido en PostgreSQL en tiempo real.
* **Fusión de Mesas (Dobles y Múltiples):**
  * **Por Arrastre Directo:** Al soltar una mesa disponible sobre otra disponible, se fusionan automáticamente en una **Mesa Doble** (capacidad 6 comensales).
  * **Por Selección Múltiple:** Modo "Unir Mesas" que permite seleccionar 2 o más mesas y agruparlas con un solo clic.
  * **Persistencia total en PostgreSQL:** La agrupación de mesas se sincroniza con el servidor y se mantiene intacta entre dispositivos y sesiones sin separarse.
* **Controles de Mesas Agrupadas:**
  * **Rotación 90°:** Botón flotante para alternar orientación horizontal / vertical.
  * **Separación / Unmerge:** Desagrupa las mesas volviendo a su capacidad individual de 4 personas.

---

### 2. Panel Lateral de Gestión y Reservaciones (Sin ventanas invasivas)
* Al hacer clic en cualquier mesa, el formulario de información o reserva se despliega en el **panel lateral derecho**, manteniendo todo el plano de la sala visible.
* **Formulario de Reserva Rápida (Mesas Disponibles):**
  * Nombre del Titular.
  * Teléfono de contacto.
  * Selector dinámico de comensales (hasta 4 en individuales, hasta 6 en dobles o más en agrupadas).
  * Cálculo automático del monto cobrado en tiempo real según el precio por comensal del evento activo.
* **Detalle de Mesa Ocupada / Reservada:**
  * Consulta de titular, teléfono, personas y total cobrado.
  * Botón para **Liberar / Limpiar Mesa** protegido por autorización de Gerente.

---

### 3. Gestión de Eventos y Precios Dinámicos
* **Selector en Cabecera:** Muestra el evento activo, fecha, hora y precio por comensal (ej. `$500 MXN / comensal`).
* **Modal de Gestión de Eventos (`EventsModal`):**
  * Registro de nuevos eventos con nombre, fecha, hora y precio por persona guardados en la tabla `events` de PostgreSQL.
  * Cambio de evento activo con actualización reactiva en todos los montos y mesas.
  * **Eliminación Segura con NIP:** Para eliminar cualquier evento del sistema, se requiere obligatoriamente ingresar el **NIP de Gerente**.

---

### 4. Seguridad y Control de Gerencia (NIP Maestro)
* **NIPs Autorizados:**
  * **NIP Gerente:** `2026`
  * **NIP Maestro Admin:** `9999`
* Acciones protegidas:
  1. **Borrado de Registros de Venta / Reservaciones:** Elimina el registro del historial de ventas y libera automáticamente las mesas asociadas.
  2. **Liberación / Limpieza de Mesas ocupadas en sala.**
  3. **Eliminación de Eventos.**
  4. **Reinicio de Fábrica del Plano de Mesas.**

---

### 5. Reporte de Ventas & Exportación (Excel / CSV)
* **Modal de Reporte de Ventas (`SalesReportModal`):**
  * Consulta directa del historial de reservas desde PostgreSQL (`/api/reservations`).
  * Indicadores clave (KPIs): Total recaudado ($ MXN), Comensales totales (Pax), Reservas activas y Tasa de ocupación de sala.
  * Desglose detallado por Folio, Evento, Titular, Teléfono, Comensales, Monto e Impresión.
  * **Exportación instantánea a Excel/CSV:** Genera y descarga el archivo con formato UTF-8 listo para contabilidad y auditoría.

---

### 6. Puente de Impresión Térmica Silenciosa (QZ Tray ESC/POS)
* Enlace por WebSockets directo a `ws://localhost:8182` con certificado digital y soporte ESC/POS nativo.
* **Doble Ticket Automático:** Genera instantáneamente el **Copia Establecimiento (Local)** y el **Copia Cliente** sin ventanas de diálogo del sistema operativo.
* Modal de configuración y prueba de impresión con diagnóstico en tiempo real.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons, QZ Tray SDK |
| **Backend** | Python 3.11, FastAPI, SQLModel, PostgreSQL Driver (psycopg2-binary), Uvicorn, Pydantic |
| **Base de Datos** | PostgreSQL 15 (`casino_reservations`) |
| **Infraestructura** | Docker, Docker Compose, Nginx Reverse Proxy (SSL Let's Encrypt) |

---

## 🌐 Producción & Despliegue

* **URL Producción:** `https://reservacion.smartopsia.com/`
* **Credenciales de Acceso:**
  * **Usuario:** `mkt`
  * **Contraseña:** `mkt2026`
  * **NIP de Gerencia:** `2026`

### Despliegue en el Servidor (VPS)
```bash
cd /root/smartops-clients/casino-prestige/reservaciones
git pull origin main
docker-compose -f docker-compose.prod.yml build reservaciones-backend reservaciones-frontend
docker-compose -f docker-compose.prod.yml up -d --no-deps reservaciones-backend reservaciones-frontend
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ y npm
* Python 3.10+ (opcional para desarrollo local sin Docker)
* Docker y Docker Compose
* QZ Tray 2.3+ instalado localmente (para tickets térmicos)

### 1. Iniciar Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Iniciar Backend
```bash
cd backend
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 📁 Estructura del Repositorio

```
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Endpoints REST (tables, reservations, events, analytics)
│   │   ├── core/           # Configuración, Engine y sesión de BD PostgreSQL
│   │   ├── models/         # Modelos SQLModel (TableNode, Reservation, Event, TicketLog)
│   │   ├── schemas/        # Esquemas de entrada/salida Pydantic
│   │   └── main.py         # Entrypoint FastAPI y registro de routers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── layout-restaurante.png  # Plano arquitectónico real del salón
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modals/
│   │   │   │   ├── EventsModal.jsx          # Gestor de eventos (con protección NIP)
│   │   │   │   ├── SalesReportModal.jsx     # Reporte de ventas y exportación CSV
│   │   │   │   └── PrinterSettingsModal.jsx # Diagnóstico QZ Tray
│   │   │   └── TableManager.jsx             # Plano interactivo, Drag & Drop y reservas
│   │   ├── services/
│   │   │   ├── api.js                       # Cliente HTTP para backend
│   │   │   └── qzService.js                 # Driver ESC/POS para QZ Tray
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.prod.yml # Configuración de producción
├── docker-compose.yml      # Configuración de desarrollo local
└── README.md
```

---

## 📄 Licencia y Créditos
Desarrollado para **Casino Prestige**. Uso interno exclusivo para operaciones POS, reservaciones y control de sala.
