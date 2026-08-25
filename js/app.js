/* ============================================================================
   INMOL · PANEL INTERACTIVO
   app.js — Navegación, modo atracción y secciones
   ============================================================================ */

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const Estado = {
  pantalla: 'atraccion',
  proyecto: null,
  lotes: [],
  loteSel: null,
  filtro: 'todos',
  seccion: 'resumen',
  temporizadorAtraccion: null,
  temporizadorInactividad: null,
  indiceAtraccion: 0
};

/* Cache de renders satelitales: se dibuja una vez y se reutiliza siempre. */
const _cacheSat = new Map();
function canvasSatelital(proyecto, nivel, ancho, alto) {
  const clave = `${proyecto.id}|${nivel}|${ancho}x${alto}`;
  if (!_cacheSat.has(clave)) {
    _cacheSat.set(clave, generarVistaSatelital(proyecto, nivel, ancho, alto));
  }
  // Se devuelve una copia para poder tener el mismo nivel en varios lugares.
  const origen = _cacheSat.get(clave);
  const copia = document.createElement('canvas');
  copia.width = origen.width; copia.height = origen.height;
  copia.getContext('2d').drawImage(origen, 0, 0);
  return copia;
}

/* Fotografía real del proyecto; si falta, la vista satelital generada.
   `variante` permite que cada pasada del modo atracción muestre otra foto. */
function medioDeFondo(proyecto, variante, ancho, alto) {
  const fotos = proyecto.fotos || [];
  if (!fotos.length) return canvasSatelital(proyecto, 2, ancho, alto);
  const img = document.createElement('img');
  img.src = fotos[Math.abs(variante || 0) % fotos.length];
  img.alt = '';
  // Si la foto no carga, no se deja un hueco: se dibuja el satelital.
  img.addEventListener('error', () => {
    const cv = canvasSatelital(proyecto, 2, ancho, alto);
    cv.className = img.className;
    img.replaceWith(cv);
  }, { once: true });
  return img;
}

/* ============================================================================
   ICONOS DE PESTAÑA
   ============================================================================ */
const ICONO_TAB = {
  resumen:     'M4 6h16M4 12h16M4 18h10',
  ubicacion:   'M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z M12 9.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z',
  referencias: 'M12 3v18M3 12h18M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18z',
  lotes:       'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z',
  ficha:       'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 8h6M9 12h6M9 16h4'
};

/* «Qué hay cerca» se fusionó dentro de «Ubicación»: los puntos de referencia
   ahora son pines sobre el mismo mapa, no una sección aparte. */
const SECCIONES = [
  { id: 'resumen',   etiqueta: 'Resumen' },
  { id: 'ubicacion', etiqueta: 'Ubicación' },
  { id: 'lotes',     etiqueta: 'Disponibilidad' },   // el proyecto puede renombrarla
  { id: 'ficha',     etiqueta: 'Ficha técnica' }
];

function svgIcono(d, tam = 22) {
  return `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}">
    <path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ============================================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================================================================ */
function irA(pantalla) {
  $$('.pantalla').forEach(p => p.classList.toggle('activa', p.id === pantalla));
  Estado.pantalla = pantalla;

  if (pantalla === 'atraccion') iniciarAtraccion();
  else detenerAtraccion();

  reiniciarInactividad();
}

/* ============================================================================
   1. MODO ATRACCIÓN
   ============================================================================ */
function iniciarAtraccion() {
  detenerAtraccion();
  Estado.indiceAtraccion = 0;
  pintarPuntosAtraccion();
  mostrarSlideAtraccion(0);
}

function detenerAtraccion() {
  clearTimeout(Estado.temporizadorAtraccion);
  Estado.temporizadorAtraccion = null;
}

function pintarPuntosAtraccion() {
  $('#atrPuntos').innerHTML = PANEL.proyectos
    .map(() => '<div class="atr-punto"></div>').join('');
}

function mostrarSlideAtraccion(i) {
  const p = PANEL.proyectos[i];
  const fondo = $('#atrFondo');
  const segundos = PANEL.config.segundosPorSlide;

  /* Fondo: fotografía real del proyecto con efecto Ken Burns.
     Si el proyecto todavía no tiene fotos, cae a la vista satelital generada. */
  const cv = medioDeFondo(p, i, 1400, 800);
  fondo.appendChild(cv);
  requestAnimationFrame(() => {
    cv.classList.add('visible');
    const previos = Array.from(fondo.children).slice(0, -1);
    previos.forEach(c => {
      c.classList.remove('visible');
      setTimeout(() => c.remove(), 1700);
    });
  });

  /* Texto */
  $('#atrKicker').textContent = `Proyecto ${i + 1} de ${PANEL.proyectos.length} · ${p.tipo}`;
  $('#atrTitulo').textContent = p.nombre;
  $('#atrClaim').textContent = p.claim;
  $('#atrDatos').innerHTML = p.destacados.slice(0, 3)
    .map(d => `<div class="atr-dato"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('');

  const centro = $('.atr-centro');
  centro.classList.remove('atr-anim', 'entrar');
  void centro.offsetWidth;                       // fuerza reinicio de la animación
  centro.classList.add('atr-anim', 'entrar');

  /* Barra de progreso del slide */
  $$('.atr-punto').forEach((pt, j) => {
    pt.style.setProperty('--dur', segundos + 's');
    pt.classList.remove('on');
    if (j === i) { void pt.offsetWidth; pt.classList.add('on'); }
  });

  Estado.indiceAtraccion = i;
  if (QUIETO) return;
  Estado.temporizadorAtraccion = setTimeout(
    () => mostrarSlideAtraccion((i + 1) % PANEL.proyectos.length),
    segundos * 1000
  );
}

/* ============================================================================
   2. MENÚ DE PROYECTOS
   ============================================================================ */
function construirMenu() {
  $('#pieWeb').textContent = PANEL.empresa.web;
  $('#pieTel').textContent = PANEL.empresa.telefono;

  const cont = $('#tarjetas');
  cont.innerHTML = '';

  PANEL.proyectos.forEach(p => {
    const t = document.createElement('button');
    t.className = 'tarjeta';
    t.innerHTML = `
      ${p.pendiente ? '<span class="tj-pendiente">Contenido pendiente</span>' : ''}
      <div class="tj-cuerpo">
        <span class="tj-tipo">${p.tipo}</span>
        <h3 class="tj-nombre">${p.nombre}</h3>
        <p class="tj-sub">${p.subtitulo}</p>
        <div class="tj-datos">
          ${p.destacados.slice(0, 2).map(d =>
            `<div class="tj-dato"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('')}
        </div>
      </div>
      <div class="tj-flecha">${svgIcono('M5 12h13M13 6l6 6-6 6', 20)}</div>`;

    t.prepend(medioDeFondo(p, 0, 760, 900));

    t.addEventListener('pointerdown', () => t.classList.add('pulsada'));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      t.addEventListener(ev, () => setTimeout(() => t.classList.remove('pulsada'), 160)));
    t.addEventListener('click', () => abrirProyecto(p.id));

    cont.appendChild(t);
  });
}

/* ============================================================================
   3. PANTALLA DE PROYECTO
   ============================================================================ */
function abrirProyecto(id, seccion = 'resumen') {
  const p = PANEL.proyectos.find(x => x.id === id);
  if (!p) return;

  Estado.proyecto = p;
  Estado.lotes = generarLotes(p);
  Estado.loteSel = null;
  Estado.filtro = 'todos';

  $('#proyNombre').textContent = p.nombre;
  $('#proySub').textContent = `${p.subtitulo} · ${p.tipo}`;

  construirTabs();
  llenarResumen(p);
  prepararUbicacion(p);
  llenarReferencias(p);
  llenarLotes(p);
  llenarFicha(p);

  irA('proyecto');
  mostrarSeccion(seccion);
}

function construirTabs() {
  const nav = $('#tabs');
  nav.innerHTML = '';
  SECCIONES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.dataset.sec = s.id;
    /* El nombre de la sección de plano depende del proyecto: en una
       urbanización es «Disponibilidad», en el centro comercial es
       «Planos y distribución». */
    const etiqueta = (s.id === 'lotes' && Estado.proyecto && Estado.proyecto.plano.etiqueta)
      ? Estado.proyecto.plano.etiqueta : s.etiqueta;
    b.innerHTML = svgIcono(ICONO_TAB[s.id], 20) + `<span>${etiqueta}</span>`;
    b.addEventListener('click', () => mostrarSeccion(s.id));
    nav.appendChild(b);
  });
}

function mostrarSeccion(id) {
  Estado.seccion = id;
  $$('.tab').forEach(t => t.classList.toggle('activa', t.dataset.sec === id));
  $$('.pane').forEach(p => p.classList.toggle('activa', p.dataset.pane === id));

  if (id === 'ubicacion') {
    setTimeout(() => MapaReal.redimensionar(), 60);
  }
  if (id === 'lotes' && MapaPlano.activo) {
    setTimeout(() => MapaPlano.encuadrar(), 60);
  }
  reiniciarInactividad();
}

/* --- 3.1 Resumen --------------------------------------------------------- */
function llenarResumen(p) {
  $('#resClaim').textContent = p.claim;
  $('#resDesc').textContent = p.descripcion;
  $('#resServicios').innerHTML = p.servicios.map(s => `<li>${s}</li>`).join('');

  /* Recuento real de unidades a partir del plano generado. En proyectos "de
     disposición" no hay noción de disponible/reservado/vendido, así que se
     dejan los destacados tal como los definió el proyecto. */
  const total = Estado.lotes.length;
  const disp  = Estado.lotes.filter(l => l.estado === 'disponible').length;
  const dest  = p.destacados.map(d => ({ ...d }));
  if (!p.pendiente && !p.plano.disposicion) {
    dest[0] = { valor: String(total), etiqueta: `${p.plano.unidadPlural} totales` };
    dest[1] = { valor: String(disp),  etiqueta: `${p.plano.unidadPlural} disponibles` };
  }
  $('#resDestacados').innerHTML = dest
    .map(d => `<div class="dest"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('');

  const btnTour = $('#btnTour360');
  btnTour.hidden = !p.recorrido360;
  btnTour.onclick = () => abrirTour360(p.recorrido360);

  /* Galería: el video del proyecto arriba y sus fotografías reales debajo */
  const gal = $('#resGaleria');
  gal.innerHTML = '';

  if (p.video) {
    const marco = document.createElement('div');
    marco.className = 'foto foto-video';
    const v = document.createElement('video');
    v.src = p.video;
    v.muted = true;          // en feria el audio molesta y no se escucha
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.preload = 'auto';
    v.addEventListener('error', () => marco.remove(), { once: true });
    marco.appendChild(v);
    const etq = document.createElement('span');
    etq.className = 'foto-etq';
    etq.textContent = 'Video del proyecto';
    marco.appendChild(etq);
    gal.appendChild(marco);
  }

  (p.fotos || []).slice(0, p.video ? 4 : 5).forEach(ruta => {
    const d = document.createElement('div');
    d.className = 'foto';
    const img = document.createElement('img');
    img.src = ruta;
    img.alt = '';
    img.addEventListener('error', () => d.remove(), { once: true });
    d.appendChild(img);
    gal.appendChild(d);
  });
}

/* Recorrido virtual 360° (Marzipano), descargado offline en assets/tour/.
   Se carga en un iframe a pantalla completa para no interferir con el resto
   del panel ni con su propio manejo de teclado/gestos. */
function abrirTour360(ruta) {
  if (!ruta) return;
  $('#tourFrame').src = ruta;
  $('#tourOverlay').hidden = false;
  reiniciarInactividad();
}
function cerrarTour360() {
  $('#tourOverlay').hidden = true;
  $('#tourFrame').src = 'about:blank';   // corta el visor 3D, libera memoria
  reiniciarInactividad();
}

/* --- 3.2 Ubicación: mapa satelital real, sin vista generada de respaldo --- */
function prepararUbicacion(p) {
  MapaReal.crear($('#mapaReal'), p);
  setTimeout(() => MapaReal.redimensionar(), 60);

  $('#satDireccion').textContent = p.direccion;
  const c = p.coordenadas;
  $('#satCoord').textContent =
    `${Math.abs(c.lat).toFixed(4)}° ${c.lat < 0 ? 'S' : 'N'}   ·   ${Math.abs(c.lng).toFixed(4)}° ${c.lng < 0 ? 'O' : 'E'}`;

  $('#satNivelNombre').textContent = 'Ubicación';
  $('#satNivelDet').textContent = `${(p.referencias || []).length} puntos de referencia`;
  $('.sat-atrib').textContent = 'Vista satelital · mapa navegable · sin conexión';
}

/* --- 3.3 Referencias ----------------------------------------------------- */
/* Lista de referencias dentro de la ficha de ubicación. Tocar una lleva el
   mapa hasta ese pin. */
function llenarReferencias(p) {
  const lista = $('#satRefs');
  lista.innerHTML = '';
  (p.referencias || []).forEach((r, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${r.nombre}</b><span>${r.distancia}</span>`;
    li.addEventListener('click', () => {
      $$('#satRefs li').forEach(o => o.classList.remove('activa'));
      li.classList.add('activa');
      MapaReal.irAReferencia(i);
    });
    lista.appendChild(li);
  });
}

/* --- 3.4 Lotes ----------------------------------------------------------- */
function llenarLotes(p) {
  const cont = $('#planoCont');

  /* Si INMOL entregó el plano oficial (con su logo y colores), se usa un
     visor Leaflet con esa imagen real y un punto por lote encima — se puede
     acercar y alejar con los dedos igual que en Ubicación. Si no, el
     esquema genérico (SVG estático, sin zoom). */
  if (p.plano.imagenReal) {
    cont.innerHTML = '';
    MapaPlano.crear(cont, p, Estado.lotes);
  } else {
    MapaPlano.destruir();
    cont.innerHTML = '';
    /* El plano se arma según la forma real del hueco disponible: en horizontal
       las manzanas quedan en fila, en un tótem vertical se apilan. */
    const proporcion = cont.clientHeight > 0 ? cont.clientWidth / cont.clientHeight : 0;
    const svg = construirPlanoSVG(p, Estado.lotes, proporcion);
    cont.appendChild(svg);
    svg.querySelectorAll('.lote').forEach(g => {
      g.addEventListener('click', () => seleccionarLote(+g.dataset.idx));
    });
  }

  $('#fichaVacia').hidden = false;
  $('#fichaDatos').hidden = true;

  /* Proyectos "de disposición" (centro comercial, etc.): sin estados de
     disponible/reservado/vendido, así que no corresponde leyenda ni
     filtros por estado — sólo se muestra la distribución de áreas. */
  $('#lotesBarra').hidden = !!p.plano.disposicion;
  if (p.plano.disposicion) return;

  /* Leyenda y filtros se arman según los estados que realmente aparecen en
     este proyecto (con datos reales no todos tienen "reservado", y sólo
     El Encanto y El Encanto 2 tienen "bloqueado"). */
  const ORDEN_ESTADOS = ['disponible', 'reservado', 'vendido', 'bloqueado'];
  const presentes = ORDEN_ESTADOS.filter(e => Estado.lotes.some(l => l.estado === e));

  const ly = $('#leyenda');
  ly.innerHTML = '';
  presentes.forEach(e => {
    const cantidad = Estado.lotes.filter(l => l.estado === e).length;
    const span = document.createElement('span');
    span.className = 'lg';
    const i = document.createElement('i');
    i.style.background = COLOR_ESTADO[e].relleno;
    span.appendChild(i);
    span.append(` ${COLOR_ESTADO[e].texto} `);
    const b = document.createElement('b');
    b.textContent = cantidad;
    span.appendChild(b);
    ly.appendChild(span);
  });

  const cf = $('#filtros');
  cf.innerHTML = '';
  const bTodos = document.createElement('button');
  bTodos.className = 'filtro activo';
  bTodos.textContent = 'Todos';
  bTodos.addEventListener('click', () => aplicarFiltro('todos', bTodos));
  cf.appendChild(bTodos);
  presentes.forEach(e => {
    const b = document.createElement('button');
    b.className = 'filtro';
    b.textContent = COLOR_ESTADO[e].texto;
    b.addEventListener('click', () => aplicarFiltro(e, b));
    cf.appendChild(b);
  });
}

function aplicarFiltro(id, boton) {
  Estado.filtro = id;
  $$('.filtro').forEach(b => b.classList.toggle('activo', b === boton));
  if (MapaPlano.activo) {
    MapaPlano.filtrar(id);
  } else {
    $$('.plano-svg .lote').forEach(g => {
      const apagar = id !== 'todos' && g.dataset.estado !== id;
      g.classList.toggle('apagado', apagar);
    });
  }
  reiniciarInactividad();
}

function seleccionarLote(idx) {
  const l = Estado.lotes[idx];
  if (!l) return;
  Estado.loteSel = l;

  if (MapaPlano.activo) {
    MapaPlano.seleccionar(idx);
  } else {
    $$('.plano-svg .lote').forEach(g => g.classList.toggle('sel', +g.dataset.idx === idx));
  }

  const est = $('#fEstado');
  if (Estado.proyecto.plano.disposicion) {
    // Sin estado comercial: la etiqueta destacada es la categoría del área
    // si existe (datos de ejemplo) o el nombre genérico de la unidad.
    est.textContent = l.categoria || (Estado.proyecto.plano.unidad || 'Unidad');
    est.className = 'ficha-estado unidad';
  } else {
    est.textContent = COLOR_ESTADO[l.estado].texto;
    est.className = 'ficha-estado ' + l.estado;
  }

  $('#fCodigo').textContent = l.codigo;
  $('#fManzana').textContent = l.manzana;

  // La disponibilidad real (snapshot de INMOL) no trae superficie ni
  // categoría por unidad — esas filas sólo se muestran cuando el dato existe.
  $('#filaSuperficie').hidden = l.superficie == null;
  if (l.superficie != null) $('#fSuperficie').textContent = `${l.superficie} m²`;
  $('#filaCategoria').hidden = !l.categoria;
  if (l.categoria) $('#fCategoria').textContent = l.categoria;

  $('#fichaVacia').hidden = true;
  $('#fichaDatos').hidden = false;
  reiniciarInactividad();
}

/* --- 3.5 Ficha técnica --------------------------------------------------- */
function llenarFicha(p) {
  /* Al costado, las cifras que más se repiten en la conversación comercial */
  $('#fichaDestacado').innerHTML = p.destacados
    .map(d => `<div class="fd"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('');

  const grupos = p.fichaGrupos || [];
  const detalle = $('#fichaDetalle');

  /* Los proyectos con ficha oficial completa —hoy el centro comercial— se
     muestran por secciones, tal como las entrega INMOL. Los demás siguen con
     la tabla corta de siempre hasta que nos pasen la suya. */
  $('#fichaTablaCaja').hidden = grupos.length > 0;
  detalle.hidden = grupos.length === 0;

  if (!grupos.length) {
    $('#fichaTabla').innerHTML = (p.fichaTecnica || []).map(f => `
      <tr>
        <th>${f.campo}</th>
        <td>${f.valor}</td>
      </tr>`).join('');
    return;
  }

  detalle.innerHTML = grupos.map((g, i) => {
    const cuerpo = g.filas
      ? `<table class="fg-tabla"><tbody>${g.filas.map(f =>
          `<tr><th>${f.campo}</th><td>${f.valor}</td></tr>`).join('')}</tbody></table>`
      : `<ul class="fg-lista">${(g.items || []).map(x => `<li>${x}</li>`).join('')}</ul>`;
    return `<section class="fg">
      <h3 class="fg-titulo"><i>${i + 1}</i>${g.titulo}</h3>
      ${cuerpo}
    </section>`;
  }).join('');
}

/* ============================================================================
   5. INACTIVIDAD — vuelve solo al modo atracción
   ============================================================================ */
/* Modo "quieto": ?quieto=1 congela la rotación y el retorno automático.
   Se usa sólo para tomar capturas de pantalla del panel. */
const QUIETO = new URLSearchParams(location.search).has('quieto');

function reiniciarInactividad() {
  clearTimeout(Estado.temporizadorInactividad);
  if (QUIETO || Estado.pantalla === 'atraccion') return;
  Estado.temporizadorInactividad = setTimeout(() => {
    Estado.proyecto = null;
    irA('atraccion');
  }, PANEL.config.segundosInactividad * 1000);
}

/* ============================================================================
   6. PANEL TÉCNICO (tecla D) — para el montaje y el soporte en feria
   ============================================================================ */
function alternarDiagnostico() {
  const d = $('#diag');
  if (!d.hidden) { d.hidden = true; return; }
  d.hidden = false;
  const refrescar = () => {
    if (d.hidden) return;
    d.innerHTML = `
      <div><b>PANEL INMOL</b> · diagnóstico</div>
      <div>Resolución: ${window.innerWidth} × ${window.innerHeight}</div>
      <div>Pantalla actual: ${Estado.pantalla}</div>
      <div>Proyecto: ${Estado.proyecto ? Estado.proyecto.nombre : '—'}</div>
      <div>Conexión: ${navigator.onLine ? 'con internet' : 'sin internet (correcto)'}</div>
      <div>Renders en caché: ${_cacheSat.size}</div>
      <div style="margin-top:.5rem;color:#5A5A66">A: atracción · M: menú · D: cerrar</div>`;
    setTimeout(refrescar, 1000);
  };
  refrescar();
}

/* ============================================================================
   7. ARRANQUE
   ============================================================================ */
function iniciar() {
  if (QUIETO) document.body.classList.add('sin-animacion');
  $('#aviso').hidden = !PANEL.config.datosDeEjemplo;
  construirMenu();

  /* Modo atracción: cualquier toque abre el menú */
  $('#atraccion').addEventListener('click', () => irA('menu'));

  $('#btnVolver').addEventListener('click', () => { Estado.proyecto = null; irA('menu'); });
  $('#btnVerTodo').addEventListener('click', () => MapaReal.centrar());
  $('#btnAcercar').addEventListener('click', () => MapaReal.acercar());
  $('#btnCerrarTour').addEventListener('click', cerrarTour360);

  /* Cualquier interacción reinicia el contador de inactividad */
  ['pointerdown', 'keydown', 'wheel'].forEach(ev =>
    document.addEventListener(ev, reiniciarInactividad, { passive: true }));

  /* Si cambia el tamaño o la orientación de la pantalla, se rehace el plano
     para que las manzanas se reacomoden a la nueva forma. */
  let temporizadorMedida;
  window.addEventListener('resize', () => {
    clearTimeout(temporizadorMedida);
    temporizadorMedida = setTimeout(() => {
      if (Estado.seccion === 'ubicacion') MapaReal.redimensionar();
      if (Estado.proyecto) {
        const sel = Estado.loteSel;
        llenarLotes(Estado.proyecto);
        if (sel) seleccionarLote(Estado.lotes.findIndex(l => l.codigo === sel.codigo));
      }
    }, 220);
  });

  /* Atajos para el operador durante el montaje */
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'd') alternarDiagnostico();
    if (k === 'a') irA('atraccion');
    if (k === 'm') irA('menu');
    if (k === 'escape') {
      if (!$('#tourOverlay').hidden) cerrarTour360();
      else irA('menu');
    }
  });

  /* Arranca siempre en modo atracción: al encender la pantalla,
     el panel retoma la presentación solo, sin que nadie toque nada.
     Con un enlace directo (#/proyecto/el-encanto/lotes) se puede abrir
     cualquier vista concreta — útil para pruebas y para capturas. */
  aplicarRuta();
  window.addEventListener('hashchange', aplicarRuta);
}

function aplicarRuta() {
  const ruta = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (!ruta) { irA('atraccion'); return; }

  const [destino, proyId, seccion, extra] = ruta.split('/');

  if (destino === 'menu')      { irA('menu'); return; }
  if (destino === 'atraccion') { irA('atraccion'); return; }

  if (destino === 'proyecto' && proyId) {
    abrirProyecto(proyId, seccion || 'resumen');
    if (extra && extra.startsWith('lote-')) {
      setTimeout(() => seleccionarLote(parseInt(extra.slice(5), 10) || 0), 250);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
