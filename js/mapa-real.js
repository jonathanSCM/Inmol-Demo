/* ============================================================================
   INMOL · PANEL INTERACTIVO
   mapa-real.js — Mapa satelital navegable, 100% offline
   ----------------------------------------------------------------------------
   Usa Leaflet (incluido en assets/leaflet/) sobre teselas satelitales reales
   (Esri World Imagery) descargadas de antemano en assets/tiles/<proyecto>/.
   Se puede arrastrar, hacer zoom con dos dedos y tocar cada pin. No depende
   de internet: todas las imágenes ya están en el disco del panel.

   Zoom disponible: 10 (toda la ciudad) a 19 (detalle del predio). Dos capas
   de teselas se combinan según el zoom:
     - assets/tiles/ciudad/       → 10-13, Santa Cruz completa, siempre activa.
     - assets/tiles/<proyecto>/   → 14-19, detalle de cada predio, se cambia
                                    al abrir cada proyecto.
   Así se puede alejar hasta ver la ciudad entera (con los tres proyectos
   marcados) y acercarse de nuevo a cualquiera de ellos. Fuera de ese rango,
   o si faltara alguna tesela puntual, Leaflet deja el cuadro en blanco.
   ============================================================================ */

const MapaReal = {
  mapa: null,
  capaCiudad: null,
  capaBase: null,
  proyectoTeselas: null,   // id del proyecto cuyas teselas están cargadas
  marcadores: [],
  marcadoresOtros: [],     // pines discretos de los demás proyectos
  rutas: [],               // líneas de acceso (ver dibujarRutas)
  calles: [],              // guía de nombres de calles (ver dibujarCalles)
  predio: [],              // contorno del terreno (ver dibujarPredio)
  disponible: false,
  proyectoActual: null,
  limiteProyecto: null,    // límite de arrastre cuando se está en zoom de detalle

  ZOOM_MIN_CIUDAD: 10,
  ZOOM_MIN_PROYECTO: 14,
  ZOOM_MAX: 19,
  // Radio real cubierto por la descarga de teselas de cada proyecto (ver
  // herramientas de descarga): un poco menor al radio descargado, de margen.
  RADIO_DESCARGADO_M: 7000,
  // Límite de arrastre cuando se está alejado viendo la ciudad: la zona real
  // cubierta por la descarga de assets/tiles/ciudad/, con margen de seguridad.
  LIMITE_CIUDAD: [[-18.38, -64.18], [-17.32, -62.22]],

  /* Leaflet está cargado y el panel tiene el mapa real habilitado */
  sePuedeUsar() {
    return typeof L !== 'undefined' && PANEL.config.mapaReal;
  },

  /* --- Pines ------------------------------------------------------------- */
  iconoProyecto() {
    return L.divIcon({
      className: 'pin-proyecto',
      html: '<span class="pin-halo"></span>' +
            '<svg viewBox="0 0 24 32" width="42" height="56">' +
            '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#E3333E"/>' +
            '<circle cx="12" cy="12" r="4.6" fill="#fff"/></svg>',
      iconSize: [42, 56], iconAnchor: [21, 56]
    });
  },

  /* Pin discreto de los otros proyectos: visible al alejarse, con el nombre
     como etiqueta. Tocarlo abre ese proyecto directamente. */
  iconoProyectoOtro(proyecto) {
    return L.divIcon({
      className: 'pin-otro',
      html: '<span class="pin-otro-circulo"><i></i></span>' +
            `<span class="pin-otro-txt">${proyecto.nombre}</span>`,
      iconSize: [32, 32], iconAnchor: [16, 16]
    });
  },

  iconoReferencia(ref, arriba) {
    const d = (typeof ICONOS !== 'undefined' && ICONOS[ref.icono]) || '';
    return L.divIcon({
      className: 'pin-ref' + (arriba ? ' pin-ref-alto' : ''),
      html: '<span class="pin-ref-circulo">' +
            `<svg viewBox="0 0 28 28" width="22" height="22"><path d="${d}" fill="none" ` +
            'stroke="#E3333E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</span>' +
            `<span class="pin-ref-txt">${ref.nombre}<b>${ref.distancia}</b></span>`,
      iconSize: [34, 34], iconAnchor: [17, 17]
    });
  },

  /* Ubicación de una referencia. Si INMOL entrega coordenadas reales se usan;
     si no, se deducen del ángulo y la distancia que ya están cargados. */
  posicionReferencia(proyecto, ref) {
    if (ref.coordenadas) return [ref.coordenadas.lat, ref.coordenadas.lng];
    const km = parseFloat(String(ref.distancia).replace(/[^0-9.]/g, '')) || 1;
    const rad = (ref.angulo || 0) * Math.PI / 180;
    const lat = proyecto.coordenadas.lat - (km / 111) * Math.cos(rad);
    const lng = proyecto.coordenadas.lng +
                (km / (111 * Math.cos(proyecto.coordenadas.lat * Math.PI / 180))) * Math.sin(rad);
    return [lat, lng];
  },

  /* --- Construcción ------------------------------------------------------- */
  crear(contenedor, proyecto) {
    if (!this.sePuedeUsar()) return false;

    if (!this.mapa) {
      this.mapa = L.map(contenedor, {
        zoomControl: false,
        attributionControl: true,
        minZoom: this.ZOOM_MIN_CIUDAD,
        maxZoom: this.ZOOM_MAX,
        // En una pantalla táctil de feria: se arrastra y se pellizca, pero no
        // se hace zoom sin querer con la rueda ni doble toque accidental.
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true,
        // No se puede arrastrar más allá del área con teselas descargadas.
        // Viscosidad 1 = tope firme, no "elástico".
        maxBoundsViscosity: 1.0
      });
      L.control.zoom({ position: 'bottomright' }).addTo(this.mapa);

      // Capa de ciudad: siempre presente, cubre todo Santa Cruz en baja
      // resolución (zoom 10-13). La capa de cada proyecto (14-19) se agrega
      // encima cuando corresponde — así se puede alejar hasta ver la ciudad
      // entera y volver a acercarse a cualquiera de los tres proyectos.
      this.capaCiudad = L.tileLayer(
        'assets/tiles/ciudad/{z}/{x}/{y}.jpg',
        {
          minZoom: this.ZOOM_MIN_CIUDAD,
          maxZoom: this.ZOOM_MIN_PROYECTO - 1,
          attribution: '© Esri — Imágenes satelitales precargadas'
        }
      ).addTo(this.mapa);

      // El límite de arrastre depende del zoom: alejado, toda la ciudad;
      // acercado, sólo el área con detalle descargada del proyecto abierto.
      this.mapa.on('zoomend', () => this.actualizarLimites());
      /* Los rótulos de calle se filtran y se reorientan al cambiar el zoom:
         de lejos sólo las troncales, de cerca todas. */
      this.mapa.on('zoomend', () => requestAnimationFrame(() => this.actualizarCalles()));
      this.mapa.on('zoomend', () => this.actualizarReferencias());
      this.actualizarLimites();
    }

    this.cargarTeselas(proyecto);
    this.dibujar(proyecto);
    this.dibujarOtrosProyectos(proyecto);
    this.disponible = true;
    return true;
  },

  /* Cada proyecto tiene su propia carpeta de teselas descargadas
     (assets/tiles/<id>/<z>/<x>/<y>.jpg). Al cambiar de proyecto se cambia
     la capa base para apuntar a la carpeta correspondiente. */
  cargarTeselas(proyecto) {
    if (this.proyectoTeselas === proyecto.id) return;
    if (this.capaBase) this.mapa.removeLayer(this.capaBase);

    this.capaBase = L.tileLayer(
      `assets/tiles/${proyecto.id}/{z}/{x}/{y}.jpg`,
      {
        minZoom: this.ZOOM_MIN_PROYECTO,
        maxZoom: this.ZOOM_MAX,
        attribution: '© Esri — Imágenes satelitales precargadas'
      }
    ).addTo(this.mapa);
    this.proyectoTeselas = proyecto.id;
    this.calcularLimiteProyecto(proyecto);
    this.actualizarLimites();
  },

  /* No dejar que el arrastre saque al usuario del área con teselas
     descargadas: más allá de eso no hay imagen (offline no hay de dónde
     traerla), así que directamente no se puede llegar ahí. */
  calcularLimiteProyecto(proyecto) {
    const { lat, lng } = proyecto.coordenadas;
    const r = this.RADIO_DESCARGADO_M;
    const dLat = r / 111320;
    const dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
    this.limiteProyecto = [
      [lat - dLat, lng - dLng],
      [lat + dLat, lng + dLng]
    ];
  },

  /* En zoom de detalle (14+) el límite es el área descargada del proyecto
     abierto; alejado, el límite es la ciudad completa. */
  actualizarLimites() {
    if (!this.mapa) return;
    const detalle = this.mapa.getZoom() >= this.ZOOM_MIN_PROYECTO && this.limiteProyecto;
    this.mapa.setMaxBounds(detalle ? this.limiteProyecto : this.LIMITE_CIUDAD);
  },

  /* Pines discretos de los proyectos que no son el que está abierto, para
     poder verlos al alejarse. Tocar uno abre ese proyecto. */
  dibujarOtrosProyectos(proyectoActual) {
    this.marcadoresOtros.forEach(m => this.mapa.removeLayer(m));
    this.marcadoresOtros = [];

    (typeof PANEL !== 'undefined' ? PANEL.proyectos : [])
      .filter(p => p.id !== proyectoActual.id)
      .forEach(p => {
        const m = L.marker([p.coordenadas.lat, p.coordenadas.lng], {
          icon: this.iconoProyectoOtro(p)
        }).addTo(this.mapa);
        m.on('click', () => {
          if (typeof abrirProyecto === 'function') abrirProyecto(p.id, 'ubicacion');
        });
        this.marcadoresOtros.push(m);
      });
  },

  /* Rutas de acceso reales (calculadas con OSRM sobre calles reales, ver
     js/rutas.js) desde puntos de referencia hasta el proyecto — el mismo
     "por dónde ir" que muestran los mapas de accesos oficiales de INMOL,
     con una línea gruesa de color y un número al inicio de cada una. */
  /* Distancia aproximada en metros entre dos [lat, lng]. */
  metros(a, b) {
    const dy = (b[0] - a[0]) * 111320;
    const dx = (b[1] - a[1]) * 111320 * Math.cos(a[0] * Math.PI / 180);
    return Math.hypot(dx, dy);
  },

  /* ==========================================================================
     CONTORNO DEL TERRENO
     --------------------------------------------------------------------------
     Los planos comerciales de INMOL sombrean el predio para que se vea de un
     vistazo qué superficie ocupa. Acá se hace lo mismo sobre el satelital: un
     relleno translúcido con borde marcado, por debajo de las rutas y los pines.
     El contorno vive en js/predios.js y se dibuja en Google My Maps; ver
     herramientas/importar-rutas.js. Si un proyecto todavía no lo tiene, no se
     dibuja nada y el mapa queda como antes.
     ========================================================================== */
  dibujarPredio(proyecto) {
    this.predio.forEach(c => this.mapa.removeLayer(c));
    this.predio = [];
    const lista = (typeof PREDIOS !== 'undefined' ? PREDIOS[proyecto.id] : null) || [];

    lista.forEach(area => {
      /* Trazo blanco por debajo: el borde rojo solo se pierde sobre los techos
         claros y sobre la tierra removida de un loteo nuevo. */
      const base = L.polygon(area.puntos, {
        color: '#FFFFFF', weight: 6, opacity: .75, fill: false, interactive: false
      }).addTo(this.mapa);
      /* Morado y no rojo: el rojo ya lo usan el pin del proyecto, los pines de
         referencia y una de las rutas de acceso. El morado se despega de todo
         eso y del verde del monte. Cada predio puede traer su propio color. */
      const tono = area.color || '#7B2FD6';
      const linea = L.polygon(area.puntos, {
        color: tono, weight: 3, opacity: 1, dashArray: '10 6',
        fillColor: tono, fillOpacity: .22
      }).addTo(this.mapa).bindPopup(
        `<b>${area.nombre || proyecto.nombre}</b><br>${this.hectareas(area.puntos)} ha`);
      this.predio.push(base, linea);
    });
  },

  /* Superficie del polígono, redondeada, para la etiqueta. */
  hectareas(p) {
    let a = 0;
    const k = Math.cos(p[0][0] * Math.PI / 180) * 111320, m = 111320;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      a += (p[j][1] * k) * (p[i][0] * m) - (p[i][1] * k) * (p[j][0] * m);
    }
    return (Math.abs(a / 2) / 10000).toFixed(2);
  },

  dibujarRutas(proyecto) {
    this.rutas.forEach(l => this.mapa.removeLayer(l));
    this.rutas = [];

    const lista = (typeof RUTAS !== 'undefined' ? RUTAS[proyecto.id] : null) || [];
    /* Varios ingresos pueden salir de la misma avenida —en El Encanto los tres
       nacen de la Doble Vía—. El rótulo se escribe una sola vez por avenida:
       repetido tres veces sólo tapa el mapa. */
    const avenidasPuestas = new Set();
    const arranques = [];
    lista.forEach((ruta, i) => {
      // Trazo blanco debajo, más ancho, para que la línea de color se lea
      // bien sobre cualquier zona de la foto satelital (oscura o clara).
      const casing = L.polyline(ruta.puntos, {
        color: '#FFFFFF', weight: 7, opacity: .85, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.mapa);
      const linea = L.polyline(ruta.puntos, {
        color: ruta.color, weight: 4, opacity: .95, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.mapa).bindPopup(`<b>${ruta.nombre}</b>`);
      this.rutas.push(casing, linea);

      /* Marca de arranque: el número de ingreso y, debajo, la avenida por la
         que se llega. Sin esto la línea parece nacer de la nada; con el rótulo
         se lee de un vistazo «se entra por tal avenida». */
      const inicio = ruta.puntos[0];
      const repetida = ruta.desde && avenidasPuestas.has(ruta.desde);
      if (ruta.desde) avenidasPuestas.add(ruta.desde);
      /* Si justo ahí ya hay un pin de referencia —en El Encanto 2 el arranque
         cae sobre el «Cruce Km 13»— el rótulo diría dos veces lo mismo y los
         globos se pisan. Pero esos pines se esconden al alejarse, y entonces
         el número quedaba solo, sin decir por dónde se entra: el rótulo se
         marca como duplicado y aparece justo cuando el pin no está. */
      const yaHayPin = (proyecto.referencias || []).some(ref => {
        const p = this.posicionReferencia(proyecto, ref);
        return this.metros(inicio, [p[0], p[1]]) < 200;
      });
      const rotulo = (ruta.desde && !repetida)
        ? `<b class="pin-ruta-via${yaHayPin ? ' pin-ruta-via-dup' : ''}">${ruta.desde}</b>` : '';
      /* Los dos ingresos del centro comercial salen del mismo punto del centro
         de la ciudad: sin esto el ① queda escondido debajo del ②. */
      const encimado = arranques.some(p => this.metros(p, inicio) < 250);
      arranques.push(inicio);
      const numero = L.marker(inicio, {
        icon: L.divIcon({
          className: 'pin-ruta-num' + (encimado ? ' pin-ruta-alto' : ''),
          html: `<span style="background:${ruta.color}">${i + 1}</span>${rotulo}`,
          iconSize: [26, 26], iconAnchor: [13, 13]
        }),
        zIndexOffset: 500
      }).addTo(this.mapa)
        .bindPopup(`<b>${ruta.nombre}</b>` +
                   (ruta.desde ? `<br>Se llega por ${ruta.desde}` : ''));
      this.rutas.push(numero);
    });

    /* Dos ingresos pueden terminar compartiendo la misma avenida —en el
       Comercial los últimos 3,2 km son idénticos, igual que en el plano de
       INMOL—. Dibujados uno encima del otro, el de abajo desaparece y de cerca
       parece que sólo hay un acceso. Se repasa ese tramo con la línea de abajo
       punteada por encima: asoman los dos colores y se leen los dos ingresos. */
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const tramo = this.tramoFinalComun(lista[i].puntos, lista[j].puntos);
        if (!tramo.length) continue;
        this.rutas.push(L.polyline(tramo, {
          color: lista[i].color, weight: 4, opacity: .95,
          dashArray: '2 13', lineCap: 'round', interactive: false
        }).addTo(this.mapa));
      }
    }
  },

  /* El tramo final que dos recorridos recorren exactamente igual, comparando
     punto por punto desde el proyecto hacia atrás. Menos de dos puntos no es
     un tramo: es sólo la llegada compartida. */
  tramoFinalComun(a, b) {
    let n = 0;
    while (n < a.length && n < b.length) {
      const p = a[a.length - 1 - n], q = b[b.length - 1 - n];
      if (Math.abs(p[0] - q[0]) > 1e-6 || Math.abs(p[1] - q[1]) > 1e-6) break;
      n++;
    }
    return n >= 2 ? a.slice(a.length - n) : [];
  },

  /* ==========================================================================
     GUÍA DE CALLES Y AVENIDAS
     --------------------------------------------------------------------------
     INMOL pidió ver los nombres de las calles sobre el satelital, «como en
     Google Maps». Google no sirve sin conexión —sus condiciones prohíben
     guardar las teselas— y la capa de rótulos de Esri no tiene datos de
     Bolivia arriba del zoom 16. Así que los nombres vienen de OpenStreetMap
     (js/calles.js) y se dibujan acá: se leen nítidos a cualquier zoom, giran
     con la calle y ocupan unos pocos KB.
     ========================================================================== */
  dibujarCalles(proyecto) {
    this.calles.forEach(c => this.mapa.removeLayer(c.capa));
    this.calles = [];
    const lista = (typeof CALLES !== 'undefined' ? CALLES[proyecto.id] : null) || [];

    lista.forEach(calle => {
      const grupo = L.layerGroup();

      /* Toda calle lleva una línea tenue debajo del nombre: así el rótulo se
         apoya en algo y se lee como parte del mapa, no como una etiqueta
         pegada encima de la foto. Más finita y tenue cuanto más chica la vía. */
      calle.t.forEach(tramo => {
        L.polyline(tramo, {
          color: '#FFFFFF', weight: calle.r === 1 ? 3 : (calle.r === 2 ? 2 : 1.4),
          opacity: calle.r === 1 ? .5 : (calle.r === 2 ? .35 : .25), interactive: false
        }).addTo(grupo);
      });

      const rotulo = L.marker(this.puntoMedio(calle.p), {
        icon: L.divIcon({
          className: 'rotulo-calle' + (calle.r === 1 ? ' rotulo-calle-troncal' : ''),
          html: `<span>${calle.n}</span>`,
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        interactive: false,
        zIndexOffset: -400              // siempre por debajo de pines y rutas
      }).addTo(grupo);

      this.calles.push({ rango: calle.r, largo: calle.l, puntos: calle.p,
                         capa: grupo, rotulo });
    });
    // No se agregan todavía: se espera a que el mapa tenga vista (ver dibujar).
  },

  /* Punto medio real del tramo (a mitad de su recorrido, no del array). */
  puntoMedio(pts) {
    const total = pts.reduce((d, _, i) => i ? d + this.metros(pts[i - 1], pts[i]) : 0, 0);
    let acum = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = this.metros(pts[i - 1], pts[i]);
      if (acum + d >= total / 2) {
        const t = d ? (total / 2 - acum) / d : 0;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
                pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
      acum += d;
    }
    return pts[Math.floor(pts.length / 2)];
  },

  /* Qué rótulos se ven y con qué inclinación, según el zoom actual.
     El ángulo se recalcula en píxeles: la proyección estira distinto según la
     latitud y el zoom, así que un ángulo fijo se despegaría de la calle. */
  actualizarCalles() {
    if (!this.mapa || !this.calles.length) return;
    /* Mientras la pestaña Ubicación está oculta el contenedor mide 0 px y el
       dibujante SVG de Leaflet todavía no tiene límites: agregarle una línea
       ahí revienta dentro de la propia librería. Se espera a redimensionar(),
       que es cuando el mapa aparece de verdad. */
    if (!this.mapa._loaded || this.mapa.getSize().x < 2) return;
    const z = this.mapa.getZoom();
    /* De lejos sólo las principales; al acercarse aparecen todas.
       No alcanza con el rango de OpenStreetMap: en Santa Cruz muchas avenidas
       largas están etiquetadas como calle de barrio, así que una calle también
       entra por longitud. Si no, en El Encanto se veían dos nombres y nada más. */
    const rangoVisible = z >= 16 ? 3 : (z >= 15 ? 2 : 1);
    const largoMinimo  = z >= 16 ? 0 : (z >= 15 ? 350 : 700);

    this.calles.forEach(c => {
      const mostrar = c.rango <= rangoVisible || c.largo >= largoMinimo;
      if (mostrar && !this.mapa.hasLayer(c.capa)) c.capa.addTo(this.mapa);
      if (!mostrar && this.mapa.hasLayer(c.capa)) this.mapa.removeLayer(c.capa);
      if (!mostrar) return;

      const a = this.mapa.latLngToLayerPoint(L.latLng(c.puntos[0]));
      const b = this.mapa.latLngToLayerPoint(L.latLng(c.puntos[c.puntos.length - 1]));
      let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      // Nunca de cabeza: si va hacia la izquierda, se le da media vuelta.
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      // El div que devuelve getElement() es el que Leaflet mueve con su
      // propio transform (translate3d) para posicionar el marcador: tocarlo
      // acá pisaría esa posición. La rotación va en el <span> de adentro, que
      // Leaflet no toca, y se reemplaza entero (no se acumula) para que cada
      // zoom/paneo no vaya sumando otra rotación sobre la anterior.
      const el = c.rotulo.getElement();
      const span = el && el.querySelector('span');
      if (span) span.style.transform = `translate(-50%, -50%) rotate(${ang.toFixed(1)}deg)`;
    });
  },

  dibujar(proyecto) {
    this.proyectoActual = proyecto;
    this.marcadores.forEach(m => this.mapa.removeLayer(m));
    this.marcadores = [];
    /* El predio primero: al dibujarse antes queda por debajo de las rutas y
       los pines sin tener que reordenar capas después. bringToBack() aquí
       falla, porque el lienzo de Leaflet todavía no está listo. */
    this.dibujarPredio(proyecto);
    this.dibujarRutas(proyecto);
    this.dibujarCalles(proyecto);

    const centro = [proyecto.coordenadas.lat, proyecto.coordenadas.lng];

    const principal = L.marker(centro, { icon: this.iconoProyecto(), zIndexOffset: 1000 })
      .addTo(this.mapa)
      .bindPopup(`<b>${proyecto.nombre}</b><br>${proyecto.direccion}`);
    this.marcadores.push(principal);

    const puestas = [];
    (proyecto.referencias || []).forEach(ref => {
      const pos = this.posicionReferencia(proyecto, ref);
      /* Dos referencias pueden venir con la misma coordenada —«Cruce Km 13» e
         «Hipermaxi Mi Barrio» la comparten en datos.js— y entonces sus rótulos
         se montan uno encima del otro. Cuando eso pasa, el segundo lleva su
         etiqueta arriba del pin en vez de abajo, para que ambos se lean. */
      const encimado = puestas.some(p => this.metros(p, pos) < 120);
      puestas.push(pos);
      const m = L.marker(pos, { icon: this.iconoReferencia(ref, encimado) })
        .addTo(this.mapa)
        .bindPopup(`<b>${ref.nombre}</b><br>a ${ref.distancia} del proyecto`);
      this.marcadores.push(m);
      // Línea punteada del proyecto a cada referencia
      const linea = L.polyline([centro, pos], {
        color: '#E3333E', weight: 1.5, opacity: .45, dashArray: '4 7'
      }).addTo(this.mapa);
      this.marcadores.push(linea);
    });

    this.centrar();
    /* Los rótulos van un cuadro después: Leaflet arma los límites de su lienzo
       SVG recién cuando termina de acomodar la vista, y si se le agrega una
       línea antes de eso falla dentro de la propia librería. */
    requestAnimationFrame(() => this.actualizarCalles());
    this.actualizarReferencias();
  },

  /* Los puntos de referencia sólo tienen sentido de cerca. Con el recorrido
     completo desde la ciudad en pantalla se apilan todos sobre el proyecto y
     no se lee ninguno, así que por debajo del zoom 14 se ocultan: queda el
     mapa de accesos limpio, como el plano que entrega INMOL. */
  actualizarReferencias() {
    if (!this.mapa || !this.marcadores.length) return;
    const cerca = this.mapa.getZoom() >= 14;
    // El primero es el pin del proyecto: ése no se esconde nunca.
    this.marcadores.slice(1).forEach(m => {
      const el = m.getElement ? m.getElement() : null;
      if (el) el.style.display = cerca ? '' : 'none';
      if (m.setStyle) m.setStyle({ opacity: cerca ? .45 : 0 });
    });
    /* El rótulo del ingreso que repetía un pin cercano hace el relevo: se
       muestra justo cuando ese pin se esconde. */
    document.querySelectorAll('.pin-ruta-via-dup').forEach(el => {
      el.style.display = cerca ? 'none' : '';
    });
  },

  /* Encuadra el proyecto con todas sus referencias.
     Sin animación: si se llama justo cuando el mapa recién se hace visible
     (tamaño 0 → tamaño real), una transición animada puede quedar a medias
     y el zoom queda mal calculado y pegado ahí. El "vuelo" cinematográfico
     ya lo da sobrevuelo()/acercar(); acá interesa que el encuadre sea exacto. */
  /* `todo` = incluir también las referencias lejanas y los recorridos de
     acceso. Sin eso el encuadre se ajusta al terreno del proyecto, que es lo
     que interesa al abrir Ubicación: con las referencias mandando, la Plaza de
     La Guardia —a 6,8 km— obligaba a alejarse tanto que el predio quedaba del
     tamaño de una uña. El botón «Ver todo» sigue mostrando el conjunto. */
  centrar(todo = true) {
    if (!this.mapa || !this.marcadores.length) return;

    const predio = [];
    this.predio.forEach(l => { if (l.getLatLngs) predio.push(...l.getLatLngs().flat()); });
    if (!todo && predio.length > 2) {
      /* El tope llega hasta donde hay teselas, en vez de a un zoom fijo: las
         urbanizaciones son tan grandes que el encuadre nunca lo alcanza, pero
         el terreno del centro comercial no llega a una hectárea y con el tope
         en 17 quedaba del tamaño de una estampilla. */
      this.mapa.fitBounds(L.latLngBounds(predio), {
        paddingTopLeft: [this.anchoFicha() + 40, 40],
        paddingBottomRight: [60, 110],
        maxZoom: this.ZOOM_MAX, animate: false
      });
      return;
    }

    const puntos = this.marcadores.filter(m => m.getLatLng).map(m => m.getLatLng());
    /* Las rutas de acceso también entran en el encuadre: si sólo se ajusta a
       los pines, las líneas se salen de la pantalla y quedan cortadas, como si
       no llevaran a ninguna parte. */
    this.rutas.forEach(l => { if (l.getLatLngs) puntos.push(...l.getLatLngs()); });
    // El contorno del terreno también entra en el encuadre.
    this.predio.forEach(l => { if (l.getLatLngs) puntos.push(...l.getLatLngs().flat()); });

    /* La ficha de ubicación flota sobre la esquina superior izquierda y los
       botones sobre la inferior. Si el encuadre no los descuenta, el arranque
       de una ruta puede quedar escondido detrás de la ficha —que fue justo lo
       que pasaba con el Ingreso 2 de Libertad—. Se mide la ficha en vivo, para
       que siga funcionando cuando la pantalla cambia de tamaño. */
    if (puntos.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(puntos), {
        paddingTopLeft:     [this.anchoFicha() + 40, 40],
        paddingBottomRight: [60, 110],
        maxZoom: 16, animate: false
      });
    } else {
      this.mapa.setView(puntos[0], 16, { animate: false });
    }
  },

  /* Ancho de la ficha flotante de ubicación, que tapa la esquina superior
     izquierda del mapa. Se mide en vivo: cambia con el tamaño de pantalla. */
  anchoFicha() {
    const f = this.mapa.getContainer().parentElement.querySelector('.sat-hud');
    return f ? Math.round(f.getBoundingClientRect().width) : 0;
  },

  /* Vuela hasta un punto de referencia y abre su etiqueta */
  irAReferencia(indice) {
    if (!this.mapa || !this.proyectoActual) return;
    const ref = (this.proyectoActual.referencias || [])[indice];
    if (!ref) return;
    const pos = this.posicionReferencia(this.proyectoActual, ref);
    this.mapa.flyTo(pos, 16, { duration: 1.6 });
    // Los marcadores se guardan como pin, línea, pin, línea… tras el principal
    const marcador = this.marcadores[1 + indice * 2];
    if (marcador && marcador.openPopup) setTimeout(() => marcador.openPopup(), 1700);
  },

  /* Vuela al proyecto, como el sobrevuelo de la vista satelital.
     Si el proyecto tiene contorno, el vuelo termina encuadrándolo: un zoom
     fijo servía cuando todos eran urbanizaciones, pero el terreno del centro
     comercial es cien veces más chico y a 17 quedaba perdido en el barrio. */
  acercar() {
    if (!this.mapa || !this.proyectoActual) return;
    const predio = [];
    this.predio.forEach(l => { if (l.getLatLngs) predio.push(...l.getLatLngs().flat()); });
    if (predio.length > 2) {
      this.mapa.flyToBounds(L.latLngBounds(predio), {
        paddingTopLeft: [this.anchoFicha() + 40, 40],
        paddingBottomRight: [60, 110],
        maxZoom: this.ZOOM_MAX, duration: 2.2
      });
      return;
    }
    const c = this.proyectoActual.coordenadas;
    this.mapa.flyTo([c.lat, c.lng], 17, { duration: 2.2 });
  },

  /* invalidateSize() sólo corrige el tamaño en píxeles del mapa; si el
     encuadre (fitBounds) se calculó antes de que el contenedor tuviera su
     tamaño final en pantalla, el zoom queda mal y hay que recalcularlo. */
  redimensionar() {
    if (!this.mapa) return;
    this.mapa.invalidateSize();
    this.centrar(false);          // al abrir Ubicación manda el terreno
    // Recién ahora el mapa tiene tamaño: es el momento de rotular las calles.
    this.actualizarCalles();
  },
};
