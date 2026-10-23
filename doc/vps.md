# Protocolo de Despliegue en DigitalOcean
**Entorno de Producción:**
* Todo el sistema se orquestará mediante `docker-compose`.
* **Contenedor 1 (PostgreSQL):** Base de datos aislada con volúmenes persistentes.
* **Contenedor 2 (FastAPI):** Expuesto internamente. Manejo de conexiones asíncronas y operaciones CRUD.
* **Contenedor 3 (Nginx):** Actuará como Proxy Inverso. Servirá los archivos estáticos generados por el build de React (`/dist`) y enrutará las peticiones `/api/*` hacia FastAPI.

**Configuración de Red:**
* Solo los puertos 80 y 443 estarán expuestos al exterior.
* Configurar Nginx para permitir WebSockets de forma bidireccional si se implementan actualizaciones en tiempo real del mapa de mesas.
