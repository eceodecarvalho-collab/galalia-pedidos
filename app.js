// ============================================================
// Galalia Algas · App de pedidos de ejemplo (HTML + CSS + JS)
// No hay servidor: el carrito se guarda en localStorage
// y el pedido solo se muestra en pantalla.
// ============================================================

// 1. Catálogo de productos (precios de ejemplo, no reales)
const PRODUCTOS = [
  {
    id: "espagueti",
    nombre: "Espagueti de mar al natural BIO",
    tipo: "Conserva en tarro",
    cientifico: "Himanthalia elongata",
    precio: 4.5,
    alegaciones: ["Bajo valor energético", "Sin grasa", "Sin azúcares",
                  "Alto contenido de fibra", "Alto contenido de yodo"],
    detalle: "29 kcal / 100 g · Fibra: 8 g / 100 g",
    color: "#2f7d4f"
  },
  {
    id: "capsulas",
    nombre: "Cápsulas Cabello",
    tipo: "Complemento alimenticio",
    cientifico: "Wakame + Fucus vesiculosus + Laminaria, con zinc, selenio y biotina",
    precio: 14.9,
    alegaciones: ["2 cápsulas al día"],
    detalle: "El zinc, el selenio y la biotina contribuyen al mantenimiento del cabello en condiciones normales.",
    aviso: "No recomendado para personas con problemas de tiroides. No superar la dosis diaria recomendada.",
    color: "#8a6d2b"
  }
];

const CLAVE = "galalia-carrito"; // nombre con el que guardamos en localStorage

// 2. Estado: el carrito es un objeto { idProducto: cantidad }
let carrito = cargarCarrito();

function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || {};
  } catch (e) {
    return {}; // si algo falla, empezamos con el carrito vacío
  }
}

function guardarCarrito() {
  localStorage.setItem(CLAVE, JSON.stringify(carrito));
}

// Da formato de euros: 4.5 -> "4,50 €"
function euros(valor) {
  return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// Ilustración SVG sencilla: un tarro o un bote de cápsulas
function dibujo(p) {
  if (p.id === "espagueti") {
    return `<svg viewBox="0 0 120 140" aria-hidden="true">
      <rect x="30" y="18" width="60" height="14" rx="4" fill="#0c3d3a"/>
      <rect x="22" y="32" width="76" height="96" rx="16" fill="#d8f1ec" stroke="#1a6b63" stroke-width="3"/>
      <path d="M40 110c-8-24 16-26 4-56M60 114c-6-26 14-30 2-62M80 110c-8-22 12-26 2-52"
            fill="none" stroke="${p.color}" stroke-width="5" stroke-linecap="round"/>
      <rect x="32" y="66" width="56" height="22" rx="4" fill="#fffdf8"/>
      <text x="60" y="81" font-size="10" text-anchor="middle" fill="#0c3d3a">BIO</text></svg>`;
  }
  return `<svg viewBox="0 0 120 140" aria-hidden="true">
    <rect x="34" y="14" width="52" height="18" rx="5" fill="#0c3d3a"/>
    <rect x="26" y="30" width="68" height="100" rx="14" fill="#fffdf8" stroke="#1a6b63" stroke-width="3"/>
    <rect x="30" y="58" width="60" height="34" fill="#e7f6f3"/>
    <ellipse cx="50" cy="112" rx="11" ry="6" fill="${p.color}"/>
    <ellipse cx="72" cy="114" rx="11" ry="6" fill="#c4a35a"/>
    <text x="60" y="80" font-size="10" text-anchor="middle" fill="#0c3d3a">Cabello</text></svg>`;
}

// 3. Pinta las tarjetas de producto
function pintarProductos() {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = PRODUCTOS.map(p => `
    <article class="tarjeta">
      <div class="ilustracion">${dibujo(p)}</div>
      <div class="cuerpo">
        <p class="tipo">${p.tipo}</p>
        <h3>${p.nombre}</h3>
        <p class="cientifico"><em>${p.cientifico}</em></p>
        <ul class="alegaciones">${p.alegaciones.map(a => `<li>${a}</li>`).join("")}</ul>
        <p class="${p.aviso ? "alegacion" : "nutri"}">${p.detalle}</p>
        ${p.aviso ? `<p class="aviso-producto">⚠️ ${p.aviso}</p>` : ""}
        <p class="precio">${euros(p.precio)} <span class="ejemplo">Precio de ejemplo</span></p>
        <div class="acciones">
          <div class="contador">
            <button type="button" data-cambio="-1" data-id="${p.id}" aria-label="Quitar una unidad">−</button>
            <input type="number" id="cant-${p.id}" value="1" min="1" max="99" aria-label="Cantidad">
            <button type="button" data-cambio="1" data-id="${p.id}" aria-label="Añadir una unidad">+</button>
          </div>
          <button type="button" class="btn-anadir" data-anadir="${p.id}">Añadir al carrito</button>
        </div>
      </div>
    </article>`).join("");
}

// 4. Pinta el carrito y calcula el total
function calcularTotal() {
  return PRODUCTOS.reduce((suma, p) => suma + (carrito[p.id] || 0) * p.precio, 0);
}

function pintarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const enCarrito = PRODUCTOS.filter(p => carrito[p.id] > 0);
  const unidades = enCarrito.reduce((s, p) => s + carrito[p.id], 0);

  lista.innerHTML = enCarrito.length === 0
    ? `<p class="vacio">Tu carrito está vacío. Añade algún producto 🌊</p>`
    : enCarrito.map(p => `
      <div class="linea">
        <div>
          <h3>${p.nombre}</h3>
          <p class="linea__datos">${carrito[p.id]} × ${euros(p.precio)} = <strong>${euros(carrito[p.id] * p.precio)}</strong></p>
        </div>
        <button type="button" class="enlace-quitar" data-quitar="${p.id}">Quitar</button>
      </div>`).join("");

  document.getElementById("total-carrito").textContent = euros(calcularTotal());
  document.getElementById("contador-cabecera").textContent = unidades;
}

// 5. Clics en botones (+, −, añadir, quitar) con un solo "escuchador"
document.addEventListener("click", evento => {
  const b = evento.target.closest("button");
  if (!b) return;

  if (b.dataset.cambio) { // botones + y −
    const input = document.getElementById("cant-" + b.dataset.id);
    const nueva = Number(input.value) + Number(b.dataset.cambio);
    input.value = Math.min(99, Math.max(1, nueva));
  }
  if (b.dataset.anadir) { // añadir al carrito
    const id = b.dataset.anadir;
    const cantidad = Math.min(99, Math.max(1, Number(document.getElementById("cant-" + id).value) || 1));
    carrito[id] = Math.min(99, (carrito[id] || 0) + cantidad);
    guardarCarrito();
    pintarCarrito();
    b.textContent = "¡Añadido! ✓";
    setTimeout(() => (b.textContent = "Añadir al carrito"), 1200);
  }
  if (b.dataset.quitar) { // quitar del carrito
    delete carrito[b.dataset.quitar];
    guardarCarrito();
    pintarCarrito();
  }
});

// 6. Validación del formulario
function mostrarError(campo, mensaje) {
  const input = document.getElementById(campo);
  const error = document.getElementById("error-" + campo);
  input.classList.toggle("invalido", Boolean(mensaje));
  error.textContent = mensaje;
  error.hidden = !mensaje;
}

function validar(datos) {
  const errores = {
    nombre: datos.nombre.length < 2 ? "Escribe tu nombre (mínimo 2 letras)." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email) ? "" : "Escribe un correo válido, por ejemplo: nombre@correo.com",
    direccion: datos.direccion.length < 8 ? "Escribe la dirección completa." : "",
    telefono: /^\+?[0-9\s]{9,15}$/.test(datos.telefono) ? "" : "Escribe un teléfono válido (9 cifras o más)."
  };
  Object.keys(errores).forEach(c => mostrarError(c, errores[c]));
  return Object.values(errores).every(e => e === "");
}

// 7. Envío: solo muestra un resumen, no envía nada a ningún sitio
document.getElementById("formulario-pedido").addEventListener("submit", evento => {
  evento.preventDefault(); // evita que la página se recargue
  const f = evento.target;
  const datos = {
    nombre: f.nombre.value.trim(),
    email: f.email.value.trim(),
    direccion: f.direccion.value.trim(),
    telefono: f.telefono.value.trim()
  };
  const errorGeneral = document.getElementById("error-formulario");
  const vacio = calcularTotal() === 0;
  errorGeneral.textContent = vacio ? "Tu carrito está vacío: añade al menos un producto." : "";
  errorGeneral.hidden = !vacio;

  if (!validar(datos) || vacio) return;

  const lineas = PRODUCTOS.filter(p => carrito[p.id] > 0)
    .map(p => `<li>${carrito[p.id]} × ${p.nombre}: ${euros(carrito[p.id] * p.precio)}</li>`).join("");

  // textContent en los datos de la persona para no interpretar HTML escrito por ella
  const resumen = document.getElementById("resumen-pedido");
  resumen.innerHTML = `<div class="resumen">
      <p>Gracias, <strong id="r-nombre"></strong>. Este sería tu pedido:</p>
      <ul>${lineas}</ul>
      <p class="total">Total: <strong>${euros(calcularTotal())}</strong> <span class="ejemplo">Precios de ejemplo</span></p>
      <h3>Envío a</h3>
      <p id="r-direccion"></p>
      <p>Correo: <span id="r-email"></span> · Teléfono: <span id="r-telefono"></span></p>
    </div>`;
  ["nombre", "direccion", "email", "telefono"].forEach(c => {
    document.getElementById("r-" + c).textContent = datos[c];
  });

  const confirmacion = document.getElementById("confirmacion");
  confirmacion.hidden = false;
  confirmacion.scrollIntoView({ behavior: "smooth" });

  carrito = {}; // vaciamos el carrito tras "hacer" el pedido
  guardarCarrito();
  pintarCarrito();
  f.reset();
});

// 8. Botón para empezar otro pedido
document.getElementById("nuevo-pedido").addEventListener("click", () => {
  document.getElementById("confirmacion").hidden = true;
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
});

// 9. Arranque de la app
pintarProductos();
pintarCarrito();
