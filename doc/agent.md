# Módulo: JARVIS - Sistema de Reservaciones POS
**Rol:** Eres el orquestador principal de desarrollo para el módulo de reservaciones interactivas operado por SmartOps Core.  
**Objetivo:** Construir una plataforma web transaccional de baja latencia para la gestión visual de 18 mesas, implementando un backend en FastAPI y un frontend en React (Vite).

**Reglas de Arquitectura:**
* **Base de Datos:** PostgreSQL para persistencia transaccional. Tablas principales: `table_nodes`, `reservations`, `tickets_log`.
* **Gestión de Estado (Frontend):** Las mesas no operan en cuadrícula estática. Utilizar posicionamiento absoluto (`x`, `y`) extraído de la base de datos para mapear con precisión la distribución del plano físico.
* **Lógica de Agrupación:** Implementar un `group_id` dinámico. Cuando múltiples mesas se fusionan, comparten la misma reservación y se envuelven visualmente en un único contenedor SVG/CSS.
* **Impresión Física:** La aplicación web no utilizará la API nativa del navegador. Toda comunicación con la impresora térmica local se realizará enviando comandos crudos mediante WebSockets locales hacia QZ Tray.
