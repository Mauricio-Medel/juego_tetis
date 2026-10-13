// ===============================
// CONFIGURACIÓN DEL JUEGO
// ===============================
const COLUMNAS = 10;
const FILAS = 20;
const TAM_CELDA = 30;

// Cada pieza se representa como una matriz. Los números identifican colores.
const PIEZAS = [
  { forma: [[1, 1, 1, 1]], color: "#45d9f5" },                 // I
  { forma: [[2, 0, 0], [2, 2, 2]], color: "#4e7bff" },        // J
  { forma: [[0, 0, 3], [3, 3, 3]], color: "#ff9f43" },        // L
  { forma: [[4, 4], [4, 4]], color: "#ffe05d" },             // O
  { forma: [[0, 5, 5], [5, 5, 0]], color: "#55e6a5" },       // S
  { forma: [[0, 6, 0], [6, 6, 6]], color: "#b18cff" },       // T
  { forma: [[7, 7, 0], [0, 7, 7]], color: "#ff6f91" }        // Z
];

const colores = {
  1: "#45d9f5", 2: "#4e7bff", 3: "#ff9f43", 4: "#ffe05d",
  5: "#55e6a5", 6: "#b18cff", 7: "#ff6f91"
};

// ===============================
// REFERENCIAS A LOS ELEMENTOS HTML
// ===============================
const canvas = document.getElementById("tablero");
const ctx = canvas.getContext("2d");
const canvasSiguiente = document.getElementById("siguiente");
const ctxSiguiente = canvasSiguiente.getContext("2d");
const puntuacionEl = document.getElementById("puntuacion");
const lineasEl = document.getElementById("lineas");
const nivelEl = document.getElementById("nivel");
const botonIniciar = document.getElementById("iniciar");
const botonPausar = document.getElementById("pausar");
const botonReiniciar = document.getElementById("reiniciar");
const mensaje = document.getElementById("mensaje");
const mensajeTitulo = document.getElementById("mensaje-titulo");
const mensajeTexto = document.getElementById("mensaje-texto");
const botonReiniciarMensaje = document.getElementById("reiniciar-mensaje");

// ===============================
// ESTADO DEL JUEGO
// ===============================
let tablero = crearTablero();
let piezaActual = null;
let piezaSiguiente = piezaAleatoria();
let puntuacion = 0;
let lineas = 0;
let nivel = 1;
let jugando = false;
let pausado = false;
let terminado = false;
let tiempoAnterior = 0;
let acumuladorCaida = 0;
let animacionId = null;

// Crea una matriz vacía de 20 filas por 10 columnas.
function crearTablero() {
  return Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));
}

// Devuelve una pieza aleatoria con una copia de su forma.
function piezaAleatoria() {
  const plantilla = PIEZAS[Math.floor(Math.random() * PIEZAS.length)];
  return {
    forma: plantilla.forma.map(fila => [...fila]),
    color: plantilla.color,
    tipo: PIEZAS.indexOf(plantilla) + 1,
    x: Math.floor((COLUMNAS - plantilla.forma[0].length) / 2),
    y: 0
  };
}

// Dibuja el tablero, la pieza fija y la pieza que está cayendo.
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b0e1b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cuadrícula de fondo.
  ctx.strokeStyle = "rgba(150, 165, 220, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLUMNAS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TAM_CELDA, 0);
    ctx.lineTo(x * TAM_CELDA, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= FILAS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TAM_CELDA);
    ctx.lineTo(canvas.width, y * TAM_CELDA);
    ctx.stroke();
  }

  // Bloques que ya quedaron fijados en el tablero.
  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      if (tablero[y][x] !== 0) dibujarCelda(ctx, x, y, colores[tablero[y][x]], TAM_CELDA);
    }
  }

  // Pieza activa.
  if (piezaActual) {
    piezaActual.forma.forEach((fila, y) => {
      fila.forEach((valor, x) => {
        if (valor) dibujarCelda(ctx, piezaActual.x + x, piezaActual.y + y, piezaActual.color, TAM_CELDA);
      });
    });
  }
}

// Dibuja una celda con borde para dar volumen a cada bloque.
function dibujarCelda(contexto, x, y, color, tamano) {
  const px = x * tamano;
  const py = y * tamano;
  contexto.fillStyle = color;
  contexto.fillRect(px + 1, py + 1, tamano - 2, tamano - 2);
  contexto.strokeStyle = "rgba(255, 255, 255, 0.35)";
  contexto.lineWidth = 1.5;
  contexto.strokeRect(px + 2, py + 2, tamano - 4, tamano - 4);
  contexto.fillStyle = "rgba(255, 255, 255, 0.16)";
  contexto.fillRect(px + 4, py + 4, tamano - 8, 3);
}

// Dibuja la vista previa de la próxima pieza.
function dibujarSiguiente() {
  ctxSiguiente.clearRect(0, 0, canvasSiguiente.width, canvasSiguiente.height);
  ctxSiguiente.fillStyle = "#252c49";
  ctxSiguiente.fillRect(0, 0, canvasSiguiente.width, canvasSiguiente.height);
  const forma = piezaSiguiente.forma;
  const tamano = 22;
  const ancho = forma[0].length * tamano;
  const alto = forma.length * tamano;
  const inicioX = (canvasSiguiente.width - ancho) / 2;
  const inicioY = (canvasSiguiente.height - alto) / 2;
  forma.forEach((fila, y) => fila.forEach((valor, x) => {
    if (valor) {
      ctxSiguiente.fillStyle = piezaSiguiente.color;
      ctxSiguiente.fillRect(inicioX + x * tamano + 1, inicioY + y * tamano + 1, tamano - 2, tamano - 2);
      ctxSiguiente.strokeStyle = "rgba(255,255,255,.4)";
      ctxSiguiente.strokeRect(inicioX + x * tamano + 2, inicioY + y * tamano + 2, tamano - 4, tamano - 4);
    }
  }));
}

// Comprueba si una pieza chocaría con los límites o con bloques ocupados.
function hayColision(pieza, moverX = 0, moverY = 0, forma = pieza.forma) {
  for (let y = 0; y < forma.length; y++) {
    for (let x = 0; x < forma[y].length; x++) {
      if (!forma[y][x]) continue;
      const nuevoX = pieza.x + x + moverX;
      const nuevoY = pieza.y + y + moverY;
      if (nuevoX < 0 || nuevoX >= COLUMNAS || nuevoY >= FILAS) return true;
      if (nuevoY >= 0 && tablero[nuevoY][nuevoX] !== 0) return true;
    }
  }
  return false;
}

// Copia la pieza que cae al tablero cuando ya no puede bajar.
function fijarPieza() {
  piezaActual.forma.forEach((fila, y) => fila.forEach((valor, x) => {
    if (valor) {
      const tableroY = piezaActual.y + y;
      const tableroX = piezaActual.x + x;
      if (tableroY >= 0) tablero[tableroY][tableroX] = piezaActual.tipo;
    }
  }));

  limpiarLineas();
  piezaActual = piezaSiguiente;
  piezaActual.x = Math.floor((COLUMNAS - piezaActual.forma[0].length) / 2);
  piezaActual.y = 0;
  piezaSiguiente = piezaAleatoria();
  dibujarSiguiente();

  if (hayColision(piezaActual)) finalizarJuego();
}

// Elimina filas completas y actualiza puntuación, líneas y nivel.
function limpiarLineas() {
  let eliminadas = 0;
  for (let y = FILAS - 1; y >= 0; y--) {
    if (tablero[y].every(celda => celda !== 0)) {
      tablero.splice(y, 1);
      tablero.unshift(Array(COLUMNAS).fill(0));
      eliminadas++;
      y++; // Revisa de nuevo la fila que ocupó esta posición.
    }
  }
  if (eliminadas > 0) {
    const puntosPorLineas = [0, 100, 300, 500, 800];
    puntuacion += (puntosPorLineas[eliminadas] || eliminadas * 200) * nivel;
    lineas += eliminadas;
    nivel = Math.floor(lineas / 10) + 1;
    actualizarMarcadores();
  }
}

// Rota la matriz de una pieza 90 grados hacia la derecha.
function girarPieza() {
  const formaGirada = piezaActual.forma[0].map((_, indice) =>
    piezaActual.forma.map(fila => fila[indice]).reverse()
  );
  if (!hayColision(piezaActual, 0, 0, formaGirada)) piezaActual.forma = formaGirada;
}

// Baja la pieza una fila; si no puede, la fija.
function bajarPieza() {
  if (!hayColision(piezaActual, 0, 1)) {
    piezaActual.y++;
    return true;
  }
  fijarPieza();
  return false;
}

// Deja caer la pieza hasta la posición más baja posible.
function caidaInstantanea() {
  while (!hayColision(piezaActual, 0, 1)) {
    piezaActual.y++;
    puntuacion += 2;
  }
  fijarPieza();
  actualizarMarcadores();
}

// Actualiza los números visibles en el panel.
function actualizarMarcadores() {
  puntuacionEl.textContent = puntuacion;
  lineasEl.textContent = lineas;
  nivelEl.textContent = nivel;
}

// Bucle principal basado en requestAnimationFrame.
function bucle(tiempo = 0) {
  if (!jugando || pausado || terminado) return;
  const delta = tiempo - tiempoAnterior;
  tiempoAnterior = tiempo;
  acumuladorCaida += delta;
  const intervalo = Math.max(100, 800 - (nivel - 1) * 65);
  if (acumuladorCaida > intervalo) {
    bajarPieza();
    acumuladorCaida = 0;
  }
  dibujar();
  animacionId = requestAnimationFrame(bucle);
}

// Comienza una partida nueva.
function iniciarJuego() {
  if (animacionId) cancelAnimationFrame(animacionId);
  tablero = crearTablero();
  piezaActual = piezaAleatoria();
  piezaSiguiente = piezaAleatoria();
  puntuacion = 0;
  lineas = 0;
  nivel = 1;
  jugando = true;
  pausado = false;
  terminado = false;
  tiempoAnterior = 0;
  acumuladorCaida = 0;
  mensaje.hidden = true;
  botonIniciar.disabled = true;
  botonPausar.disabled = false;
  botonPausar.textContent = "Pausar";
  actualizarMarcadores();
  dibujarSiguiente();
  dibujar();
  animacionId = requestAnimationFrame(bucle);
}

// Finaliza la partida y muestra el resultado.
function finalizarJuego() {
  jugando = false;
  terminado = true;
  pausado = false;
  if (animacionId) cancelAnimationFrame(animacionId);
  mensajeTitulo.textContent = "¡Juego terminado!";
  mensajeTexto.textContent = `Puntuación final: ${puntuacion} puntos.`;
  mensaje.hidden = false;
  botonIniciar.disabled = false;
  botonPausar.disabled = true;
  dibujar();
}

// Pausa o reanuda la partida.
function alternarPausa() {
  if (!jugando || terminado) return;
  pausado = !pausado;
  botonPausar.textContent = pausado ? "Continuar" : "Pausar";
  if (!pausado) {
    tiempoAnterior = 0;
    animacionId = requestAnimationFrame(bucle);
  } else if (animacionId) {
    cancelAnimationFrame(animacionId);
  }
}

// Escucha las teclas de control del juego.
document.addEventListener("keydown", evento => {
  const teclasJuego = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "];
  if (teclasJuego.includes(evento.key)) evento.preventDefault();
  if (evento.key.toLowerCase() === "p") {
    alternarPausa();
    return;
  }
  if (!jugando || pausado || terminado || !piezaActual) return;

  switch (evento.key) {
    case "ArrowLeft":
      if (!hayColision(piezaActual, -1, 0)) piezaActual.x--;
      break;
    case "ArrowRight":
      if (!hayColision(piezaActual, 1, 0)) piezaActual.x++;
      break;
    case "ArrowDown":
      if (bajarPieza()) puntuacion++;
      actualizarMarcadores();
      break;
    case "ArrowUp":
      girarPieza();
      break;
    case " ":
      caidaInstantanea();
      break;
  }
  dibujar();
});

// Conecta los botones con sus funciones.
botonIniciar.addEventListener("click", iniciarJuego);
botonReiniciar.addEventListener("click", iniciarJuego);
botonReiniciarMensaje.addEventListener("click", iniciarJuego);
botonPausar.addEventListener("click", alternarPausa);

// Prepara el tablero para que la página se vea lista al abrirse.
actualizarMarcadores();
dibujar();
dibujarSiguiente();


// ===============================
// CONTROLES TÁCTILES (TABLET / MÓVIL)
// ===============================
const botonesTactiles = document.querySelectorAll("[data-accion]");
let repeticionTactil = null;

function ejecutarAccionTactil(accion) {
  if (accion === "pausa") {
    alternarPausa();
    return;
  }

  if (!jugando || pausado || terminado || !piezaActual) return;

  switch (accion) {
    case "izquierda":
      if (!hayColision(piezaActual, -1, 0)) piezaActual.x--;
      break;
    case "derecha":
      if (!hayColision(piezaActual, 1, 0)) piezaActual.x++;
      break;
    case "abajo":
      if (bajarPieza()) puntuacion++;
      actualizarMarcadores();
      break;
    case "girar":
      girarPieza();
      break;
    case "caida":
      caidaInstantanea();
      break;
  }
  dibujar();
}

botonesTactiles.forEach(boton => {
  const accion = boton.dataset.accion;
  const accionRepetible = ["izquierda", "derecha", "abajo"].includes(accion);

  boton.addEventListener("pointerdown", evento => {
    evento.preventDefault();
    boton.setPointerCapture?.(evento.pointerId);
    ejecutarAccionTactil(accion);

    if (accionRepetible) {
      clearInterval(repeticionTactil);
      repeticionTactil = setInterval(() => ejecutarAccionTactil(accion), 115);
    }
  });

  const detenerRepeticion = () => {
    clearInterval(repeticionTactil);
    repeticionTactil = null;
  };

  boton.addEventListener("pointerup", detenerRepeticion);
  boton.addEventListener("pointercancel", detenerRepeticion);
  boton.addEventListener("lostpointercapture", detenerRepeticion);
  boton.addEventListener("contextmenu", evento => evento.preventDefault());
});

// No dejar que una pieza siga cayendo si se cambia de pestaña.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && jugando && !pausado) alternarPausa();
});

