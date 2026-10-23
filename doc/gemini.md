# Directrices de Generación de Código y Diseño
**Estricto Cumplimiento de Stack:**
* Frontend: React, Vite, TailwindCSS.
* Backend: Python, FastAPI, SQLAlchemy/SQLModel.

**Sistema de Diseño Visual:**
* **Fondo Principal:** `#030712` (Oscuro profundo).
* **Componentes y Modales:** Diseño glassmórfico utilizando `bg-[#0b0f19]/80`, `backdrop-blur-md` y bordes sutiles `border-gray-800`.
* **Acentos y Estados Activos:** Verde neón `#00FF66` para confirmaciones, botones principales y mesas disponibles.
* **Tipografía:** Obligatorio el uso de `font-['JetBrains_Mono']` para todos los datos ingresados, números de mesa, horas e información tabular.

**Interacción y UX:**
* **Atajos de Teclado (Single-Key):** Implementar listeners globales. `R` (Nueva Reserva), `J` (Agrupar Mesas), `P` (Imprimir).
* Evitar transiciones lentas. El sistema debe responder en tiempo real para optimizar la velocidad en piso.
