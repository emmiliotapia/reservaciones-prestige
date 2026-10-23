# Casino Prestige - Sistema de Gestión de Reservaciones & POS

Sistema integral de gestión de reservas, punto de venta (POS) y mapeo interactivo de mesas con plano arquitectónico a escala real e impresión térmica silenciosa dual (QZ Tray ESC/POS).

---

## 🏛️ Características Principales

### 1. Mapeo Interactivo de Mesas sobre Plano Arquitectónico Real
* **Plano arquitectónico auténtico:** Basado en el plano de sala real (`layout-restaurante.png`), escalado de forma proporcional y limpia con `aspect-[4/5]`, adaptado al ancho de pantalla con desplazamiento vertical fluido (`overflow-y-auto`).
* **Arrastre Libre de Mesas (Drag & Drop):** Posicionamiento libre y milimétrico con Framer Motion sin rebotes indeseados ni forzado a cuadrículas estáticas.
* **Fusión de Mesas en Dobles por Arrastre Directo:** Al arrastrar una mesa disponible y soltarla directamente encima de otra mesa disponible, se fusionan automáticamente en una **Mesa Doble** (2 mesas de largo con el mismo grosor exacto).
* **Control de Mesas Dobles:**
  * **Rotación 90°:** Botón flotante para alternar orientación horizontal / vertical conservando la proporción geométrica 2x1 y 1x2.
  * **Separación / Unmerge:** Botón flotante para disolver la mesa doble y recuperar 2 mesas individuales de 4 personas.
* **Capacidades de Sala:**
  * Mesas individuales: **4 personas** (1 a 4 comensales).
  * Mesas dobles: **6 personas** (1 a 6 comensales).

---

### 2. Panel Lateral de Gestión y Reservaciones (Sin ventanas invasivas)
* Al hacer clic en cualquier mesa, el formulario de información o reserva se despliega exclusivamente en el **panel lateral derecho**, manteniendo todo el plano de la sala 100% visible.
* **Formulario de Reserva Rápida (Mesas Disponibles):**
  * Nombre del Titular.
  * Teléfono de contacto.
  * Selector dinámico de comensales (hasta 4 en individuales, hasta 6 en dobles).
  * Cálculo automático del monto cobrado en tiempo real según el precio por comensal del evento activo.
* **Detalle de Mesa Ocupada / Reservada:**
  * Consulta de titular, teléfono, personas y total cobrado.
  * Botón para **Liberar / Limpiar Mesa** con restablecimiento inmediato de disponibilidad.

---

### 3. Gestión de Eventos Mensuales y Precios Dinámicos
* **Selector en Cabecera:** Muestra el evento activo, fecha y precio por comensal (ej. `$500 MXN / comensal`).
* **Modal de Historial de Eventos (`EventsModal`):**
  * Registro de nuevos eventos con nombre, fecha y precio por persona.
  * Historial de eventos anteriores.
  * Cambio de evento activo con actualización reactiva en todos los montos de reservación.

---

### 4. Puente de Impresión Térmica Silenciosa (QZ Tray ESC/POS)
* Enlace por WebSockets directo a `ws://localhost:8182` con certificado digital y soporte ESC/POS nativo.
* **Doble Ticket Automático:** Genera instantáneamente el **Copia Establecimiento (Local)** y el **Copia Cliente** sin abrir ventanas de diálogo del sistema operativo.
* Modo fallback integrado: Si QZ Tray no está instalado o no se encuentra activo, el sistema ejecuta una simulación limpia y notifica al usuario sin bloquear la operación de sala.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons, QZ Tray SDK |
| **Backend** | Python 3.11, FastAPI, SQLModel, Uvicorn, Pydantic |
| **Base de Datos** | PostgreSQL 15 |
| **Infraestructura** | Docker, Docker Compose, Nginx Proxy |

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ y npm
* Python 3.10+ (opcional para desarrollo local sin Docker)
* Docker y Docker Compose (para despliegue completo)
* QZ Tray instalado (para impresión térmica física)

### 1. Iniciar Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://127.0.0.1:3000/`.

### 2. Iniciar Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
La documentación Swagger de la API estará en `http://127.0.0.1:8000/docs`.

### 3. Despliegue con Docker Compose
```bash
docker-compose up -d --build
```
Levanta de forma orquestada PostgreSQL, FastAPI y el frontend con Nginx.

---

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Endpoints REST (tables, reservations, events, analytics)
│   │   ├── core/           # Configuración y conexión de base de datos
│   │   ├── models/         # Modelos SQLModel (TableNode, Reservation, Event, TicketLog)
│   │   └── main.py         # Entrypoint FastAPI
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── layout-restaurante.png  # Plano arquitectónico real del salón
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modals/
│   │   │   │   └── EventsModal.jsx   # Gestor de eventos mensuales
│   │   │   └── TableManager.jsx      # Componente principal interactivo del plano
│   │   ├── services/
│   │   │   ├── api.js                # Consumo de API REST
│   │   │   └── qzService.js          # Driver ESC/POS para QZ Tray
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── nginx/                  # Configuración de proxy inverso para producción
├── docker-compose.yml      # Orquestación de contenedores
└── README.md
```

---

## 📄 Licencia y Créditos
Desarrollado para Casino Prestige. Uso interno y exclusivo para operaciones POS y control de sala.
