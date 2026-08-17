# Deep Claros Cleaning Services LLC — landing (borrador)

Sitio estático de una sola página. Sin build, sin dependencias: se abre con doble clic o se sirve como archivos.

```
index.html
assets/styles.css     paleta, tipografía, layout
assets/i18n.js        textos ES / EN
assets/app.js         idioma, línea de limpieza, acordeón, buscador de ciudad, formulario
assets/favicon.svg
assets/logo.png       ← falta: poner aquí el logo real
```

## Lo que falta para publicarlo de verdad

1. **Logo.** Guardar el logo en `assets/logo.png` (PNG con fondo transparente, alto ~200 px). Mientras no exista, el encabezado muestra el nombre escrito; al poner el archivo aparece solo, sin tocar código.
2. **Reseñas.** No se inventó ninguna. Cuando haya reseñas reales de Google o Thumbtack, se agrega la sección.
3. **Datos del negocio.** Años de experiencia, tamaño del equipo y número de licencia no están puestos porque nadie los confirmó. Se agregan cuando el cliente los dé.
4. **Fotos.** El sitio funciona sin fotos a propósito. Si hay fotos reales de trabajos (antes/después), van en la portada.

## Idiomas

Detecta el idioma del navegador y elige español o inglés. La persona puede cambiarlo con el botón ES/EN y la elección se guarda en el navegador.

Para agregar otro idioma: en `assets/i18n.js`, copiar el bloque `en`, traducirlo, y añadir el código a `supported`. Nada más cambia.

## Contacto que usa el sitio

- Teléfono: `+1 (240) 408-6532` → `tel:` y `https://wa.me/12404086532`
- Correo: `deep.claroscleaningservices@gmail.com`

El formulario no tiene servidor: arma el mensaje y abre WhatsApp o el correo del visitante para que lo envíe. Si más adelante se quiere que llegue solo, se conecta a Formspree o similar.
