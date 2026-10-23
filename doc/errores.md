# Protocolos de Resolución de Problemas Frecuentes
* **Fallo de Conexión QZ Tray:** Si el navegador arroja `ERR_CONNECTION_REFUSED` en el puerto 8182, renderizar un modal de advertencia indicando al operador que inicie el servicio QZ Tray en Windows.
* **Colisión de Estado en DB:** Si dos usuarios intentan agrupar las mismas mesas simultáneamente, FastAPI debe retornar un error 409 Conflict. El frontend debe capturarlo y refrescar el estado del lienzo.
* **Problemas de CORS:** Asegurar que el middleware de FastAPI acepte peticiones explícitas del dominio configurado en DigitalOcean, permitiendo cabeceras y métodos POST/PUT.
* **Desalineación de Nodos (UI):** Si las resoluciones de pantalla cambian, el posicionamiento del lienzo opera sobre una relación de aspecto fija con escalado proporcional y contenedor con overflow adaptable para evitar que las mesas se traslapen fuera del plano físico.
