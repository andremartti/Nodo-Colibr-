# Nodo Colibrí — sitio web

Sitio de una sola página para **Nodo Colibrí**, estudio digital de diseño y desarrollo web.
Dirección visual: *glassmorphism premium* sobre una paleta de verdes profundos, con
iluminación ambiental, capas de cristal flotantes y animaciones sutiles.

Es un sitio estático (HTML + CSS + JavaScript, sin dependencias ni paso de compilación),
listo para publicarse en GitHub Pages, Netlify, Vercel o cualquier hosting.

## Estructura

```
index.html              Contenido y estructura de todas las secciones
assets/css/styles.css   Sistema de diseño (tokens, cristal, secciones, animaciones)
assets/js/main.js       Interacciones (WhatsApp, menú, parallax, FAQ, formulario)
assets/img/             Logotipo, favicon e imagen para redes (og-image.jpg)
```

## Verlo en local

```bash
python3 -m http.server 4173
# abrir http://localhost:4173
```

## Ediciones frecuentes

### Número de WhatsApp

Todos los botones de WhatsApp se generan desde una sola constante en `assets/js/main.js`:

```js
const WHATSAPP_NUMBER = '50687797996'; // código de país + número, sin "+" ni espacios
```

El número está configurado con el código de **Costa Rica (+506)**. Si corresponde a otro país,
cambia el prefijo ahí y también en `index.html` (enlaces de respaldo `https://wa.me/50687797996`,
el número visible `+506 8779 7996` y el `telephone` del bloque JSON-LD). Un reemplazo global de
`50687797996` y de `+506 8779 7996` cubre todo.

Cada botón define su mensaje prellenado en el atributo `data-wa`, por ejemplo:

```html
<a data-wa="Hola Nodo Colibrí, me interesa el plan Profesional.">…</a>
```

El formulario de contacto no necesita servidor: arma el mensaje con los datos del visitante y
abre WhatsApp listo para enviar.

### Contenido de referencia que conviene revisar

- **Precios y alcances de los planes** (sección `#planes`): $390, $790 y desde $1,490 USD son valores de referencia.
- **Tiempos de entrega y soporte** (planes y preguntas frecuentes).
- **Portafolio** (sección `#portafolio`): los cuatro proyectos están marcados como *Concepto* y
  sus pantallas están dibujadas con CSS. Reemplázalos por proyectos reales cuando los tengas.
- **Imagen para redes**: `og:image` usa una ruta relativa; cuando el sitio tenga dominio, cámbiala
  por la URL absoluta (por ejemplo `https://tudominio.com/assets/img/og-image.jpg`).

### Colores

Los tokens están al inicio de `assets/css/styles.css`:

| Token          | Valor     | Uso                        |
| -------------- | --------- | -------------------------- |
| `--forest-900` | `#071D16` | Fondo principal            |
| `--forest-800` | `#0D3024` | Verde profundo             |
| `--emerald`    | `#176B4B` | Acentos y luces ambientales |
| `--mint`       | `#65D6A0` | Verde luminoso, interacción |
| `--graphite`   | `#0B1411` | Contrastes oscuros         |

## Notas técnicas

- **Cristal real:** las superficies usan `backdrop-filter` sobre un fondo con luces y formas
  desenfocadas, así que siempre hay algo que se ve a través del vidrio. Ningún contenedor
  de las tarjetas usa `opacity`, `filter` o `mask` permanentes, porque eso rompería el desenfoque.
- **Rendimiento:** en pantallas de 960 px o menos se reduce el desenfoque, se detienen las luces
  animadas y se ocultan capas decorativas. El parallax solo usa `translate` en `requestAnimationFrame`.
- **Accesibilidad:** enlace para saltar al contenido, foco visible, acordeón con `aria-expanded`,
  respeto de `prefers-reduced-motion` y alternativa más opaca si el navegador no soporta
  `backdrop-filter`.
