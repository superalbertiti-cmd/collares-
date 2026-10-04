# ULLAN GPS

Web de collares localizadores para vacas, con las imágenes y el logo ULLAN GPS. Incluye capa de interacción: collar con puntos clicables, simulador de vallado virtual, calculadora de estimación y animaciones al hacer scroll.

## Abrir en local

Desde la raíz del proyecto: `python -m http.server 8000 --directory dist`. Visita http://localhost:8000. No requiere instalar paquetes.

## Publicar en Vercel

Importa este repositorio. La configuración está en `vercel.json`: Framework Other, directorio raíz del repositorio, salida `dist`, sin instalación ni compilación.

Tras publicar, actualiza el dominio de las etiquetas canonical, Open Graph, datos estructurados y sitemap. La web conserva noindex y robots bloqueado mientras se completa el lanzamiento comercial.

## Contenido

- `dist/index.html`: página principal.
- `dist/style.css` y `dist/app.js`: estilos e interacciones.
- `dist/`: imágenes WebP, logo, favicon, tipografías y páginas informativas.
- WhatsApp: +34 603 682 555.
- Precios orientativos: collar 5G 100 €, collar con antena 110 €, antena aparte 800 €.

## Estado comercial

La consulta por WhatsApp funciona. No hay pasarela de pago ni gestión de pedidos. Los diseños del producto son conceptuales. Antes del lanzamiento, completar los datos del vendedor, condiciones comerciales y validación técnica.

Exportado de la versión publicada de ULLAN GPS, commit d8d6f7f7d55836c5c9e6fe18b793be23e6cc0dad.
