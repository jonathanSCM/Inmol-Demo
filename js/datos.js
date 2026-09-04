/* ============================================================================
   INMOL · PANEL INTERACTIVO DE FERIA
   datos.js — ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CARGAR CONTENIDO
   ----------------------------------------------------------------------------
   Los textos, cifras, fotografías y videos se tomaron del sitio oficial
   inmol.com.bo y del documento "DATOS PARA ELABORACION SISTEMA EXPOCRUZ"
   que entregó INMOL. Los puntos de referencia se investigaron en Google
   Maps a partir de la ubicación real de cada proyecto (o de los mapas de
   referencia oficiales de INMOL cuando estaban disponibles) — nombre,
   distancia en auto y coordenadas verificadas.

   La disponibilidad de lotes/locales (disponible/vendido/reservado/
   bloqueado) es un snapshot real descargado del sistema de INMOL
   (inmol.sistemas-orange.com.bo), cargado en los archivos
   js/disponibilidad-<proyecto>.js. Para actualizarla antes de la próxima
   feria, hay que volver a correr la herramienta de descarga.
   ============================================================================ */

const PANEL = {

  /* --- Datos de la empresa ------------------------------------------------ */
  empresa: {
    nombre: 'INMOL',
    lema: 'Desarrollos Inmobiliarios con respaldo y confianza',
    web: 'www.inmol.com.bo',
    telefono: '+591 755 90031',
    oficina: 'Edificio Trébol, Piso 1, Of. 1A · Fortín Corrales 141, Santa Cruz',
    logo: 'assets/inmol-logo.png',
    // Video institucional que se usa en el modo atracción.
    video: 'assets/medios/video/inmol-home.mp4'
  },

  /* --- Comportamiento del kiosco ------------------------------------------ */
  config: {
    // Segundos sin que nadie toque la pantalla antes de volver al modo atracción.
    segundosInactividad: 90,
    // Segundos que dura cada slide del modo atracción.
    segundosPorSlide: 11,
    // Mostrar precios en pantalla. Definido en NO por decisión comercial.
    mostrarPrecios: false,
    // Aviso discreto de contenido de demostración. Apagar al cargar lo definitivo.
    datosDeEjemplo: false,
    // Mapa satelital real con teselas precargadas (100% offline).
    mapaReal: true
  },

  /* --- PROYECTOS ---------------------------------------------------------- */
  proyectos: [

    /* ====================== 1. URBANIZACIÓN EL ENCANTO ==================== */
    {
      id: 'el-encanto',
      nombre: 'Urbanización El Encanto',
      subtitulo: 'La Guardia · Santa Cruz',
      tipo: 'Urbanización residencial',
      estadoComercial: 'En comercialización',
      claim: 'Vivir la naturaleza con todas las comodidades.',
      descripcion: 'Estratégicamente ubicada a la altura del Km 16 de la Doble ' +
                   'Vía La Guardia, a tan solo 3 minutos de la carretera, en una ' +
                   'zona consolidada con vías de acceso pavimentadas, colegios, ' +
                   'centros de salud y mercados. El Municipio de La Guardia ' +
                   'combina el crecimiento urbano, el acceso a servicios básicos, ' +
                   'un clima agradable y un entorno natural atractivo.',

      // Ubicación exacta. Código Plus 57JR3PV3+WP2, del enlace de Maps de INMOL.
      coordenadas: { lat: -17.90523, lng: -63.29574 },
      direccion: 'Av. Doble Vía La Guardia Km 16, Santa Cruz',
      enlaceMapa: 'https://maps.app.goo.gl/i7Aw7BNJCNMzEWzn6',
      recorrido360: 'assets/tour/el-encanto/index.html',

      // Semilla del generador de vista satelital de respaldo (sin internet).
      semilla: 20481,

      // Fotografías reales del proyecto (dron y cámara).
      fotos: [
        'assets/medios/el-encanto/el-encanto-01.jpg',
        'assets/medios/el-encanto/el-encanto-02.jpg',
        'assets/medios/el-encanto/el-encanto-03.jpg',
        'assets/medios/el-encanto/el-encanto-04.jpg',
        'assets/medios/el-encanto/el-encanto-05.jpg',
        'assets/medios/el-encanto/el-encanto-06.jpg',
        'assets/medios/el-encanto/el-encanto-07.jpg',
        'assets/medios/el-encanto/el-encanto-08.jpg',
        'assets/medios/el-encanto/el-encanto-09.jpg',
        'assets/medios/el-encanto/el-encanto-10.jpg'
      ],
      video: 'assets/medios/video/el-encanto.mp4',

      destacados: [
        { valor: '1.101',        etiqueta: 'terrenos' },
        { valor: '300 – 600 m²', etiqueta: 'superficie de terrenos' },
        { valor: '64,58 ha',     etiqueta: 'superficie total' },
        { valor: 'Km 16',        etiqueta: 'Doble Vía La Guardia' }
      ],

      // Puntos de referencia del mapa oficial de INMOL para este proyecto
      // ("VÍAS DE ACCESO" + puntos de interés de La Guardia), ubicados en
      // Google Maps para tener distancia real y coordenadas exactas.
      referencias: [
        { nombre: 'Av. Doble Vía La Guardia',      distancia: '0.2 km', icono: 'via',      angulo: 20 },
        { nombre: 'U.E. Victoria',                 distancia: '2.8 km', icono: 'colegio',  angulo: 250,
          coordenadas: { lat: -17.8966432, lng: -63.3204914 } },
        { nombre: 'Centro de Salud San Silvestre', distancia: '2.9 km', icono: 'salud',    angulo: 152,
          coordenadas: { lat: -17.8905435, lng: -63.2876494 } },
        { nombre: 'Mercado Campesino La Guardia',  distancia: '2.9 km', icono: 'comercio', angulo: 238,
          coordenadas: { lat: -17.8914751, lng: -63.3186963 } },
        { nombre: 'Plaza Principal de La Guardia', distancia: '6.8 km', icono: 'plaza',    angulo: 248,
          coordenadas: { lat: -17.8918621, lng: -63.3310429 } }
      ],

      servicios: [
        '1.500 m de pavimento dentro de la urbanización', 'Educación cercana: colegios a fácil acceso',
        'Salud a pocos minutos', 'Mercados y transporte público',
        'Luz y agua potable, con pozo propio', 'Gas e internet de fácil acceso',
        'Áreas verdes y de recreación', 'Área de equipamiento amplio',
        'Drenaje pluvial y protección contra inundaciones'
      ],

      // Ficha técnica: los datos que el vendedor necesita a mano.
      fichaTecnica: [
        { campo: 'Tipología',            valor: 'Urbanización abierta' },
        { campo: 'Ubicación',            valor: 'La Guardia, Km 16 · a 3 min de la carretera' },
        { campo: 'Superficie total',     valor: '64,58 hectáreas' },
        { campo: 'Cantidad de terrenos', valor: '1.101' },
        { campo: 'Superficie de terrenos', valor: '300 m² a 600 m²' },
        { campo: 'Pavimento',            valor: '1.500 m dentro de la urbanización' },
        { campo: 'Servicios básicos',    valor: 'Luz, agua potable (pozo propio), gas e internet' },
        { campo: 'Áreas verdes',         valor: 'Sí, con espacios recreativos y equipamiento' },
        { campo: 'Estado comercial',     valor: 'En comercialización' }
      ],

      /* Ficha técnica completa, transcrita de la ficha oficial de INMOL
         (PDF-Fichas-ElEncanto2026, secciones 1 a 9 de FICHA TÉCNICA más la
         ficha legal). La tabla corta de arriba queda como resumen; esto es el
         detalle que el asesor muestra en pantalla.
         Sin precios: es decisión comercial de INMOL no exhibirlos. */
      fichaGrupos: [
        {
          titulo: 'Superficie',
          filas: [
            { campo: 'Superficie total', valor: '64,58 hectáreas · 645.801,07 m²' },
            { campo: 'Área útil',        valor: '387.504,20 m² — 60,00 %' },
            { campo: 'Área de calles',   valor: '118.168,45 m² — 18,30 %' },
            { campo: 'Área de avenidas', valor: '70.356,99 m² — 10,89 %' },
            { campo: 'Área de equipamiento', valor: '41.522,48 m² — 6,43 %' },
            { campo: 'Áreas verdes',     valor: '28.248,95 m² — 4,37 %' },
            { campo: 'Terrenos',         valor: '1.101 lotes de 300 m² a 851,68 m², dentro del área útil' }
          ]
        },
        {
          titulo: 'Sistema de drenaje pluvial',
          items: [
            'La urbanización se diseñó y construyó para que todos los lotes queden por encima de las calles y drenen el agua hacia ellas',
            'Todas las calles cumplen la función de canalización terciaria',
            'Aseguran la evacuación de toda el agua fuera de la urbanización, para evitar inundaciones'
          ]
        },
        {
          titulo: 'Protección contra inundaciones',
          items: [
            'El agua que llega de urbanizaciones vecinas se colecta en el canal P4c, construido respetando el Plan Maestro de Drenaje del Municipio de La Guardia',
            'El canal P4b protege a las urbanizaciones vecinas del agua que sale de El Encanto'
          ]
        },
        {
          titulo: 'Protección contra la erosión',
          items: [
            'El 100 % de la superficie —manzanos, áreas verdes y de equipamiento— está sembrada con pasto de la variedad decumbens revestida',
            'Protege el suelo de la erosión hídrica y eólica, típica de la zona'
          ]
        },
        {
          titulo: 'Pavimento',
          items: [
            'Dos accesos principales pavimentados, más de 1.500 m',
            'Funcionan además como canales terciarios de drenaje'
          ]
        },
        {
          titulo: 'Agua potable',
          filas: [
            { campo: 'Red',        valor: 'Diseñada para toda la urbanización; pasa por las aceras para no perjudicar el pavimento actual ni el que se construya' },
            { campo: 'Conexión',   valor: 'Mediante pozo propio, en coordinación con la Cooperativa de Agua Potable de La Guardia (COSPLAG)' },
            { campo: 'Caudal',     valor: '14 a 15 litros por segundo, según la demanda proyectada' },
            { campo: 'Pozo',       valor: '250 m de profundidad y 10” de diámetro' },
            { campo: 'Filtros',    valor: 'De acero al carbón y tipo Johnson, para evitar la corrosión y garantizar la durabilidad' }
          ]
        },
        {
          titulo: 'Energía eléctrica y gas',
          items: [
            'Energía eléctrica a través de la Cooperativa Rural de Electrificación (CRE)',
            'Gas domiciliario solicitándolo directamente a YPFB'
          ]
        },
        {
          titulo: 'Obra social ejecutada',
          filas: [
            { campo: 'Total invertido', valor: 'Bs. 4.213.480,67, en cumplimiento del Decreto Municipal 35/2022' },
            { campo: 'Luminarias',      valor: '273 unidades · Bs. 581.039,55' },
            { campo: 'Maquinaria',      valor: '1 motoniveladora modelo 140K · Bs. 2.164.560' },
            { campo: 'Pavimento',       valor: 'Bs. 1.467.881,12' }
          ]
        },
        {
          titulo: 'Aprobaciones y documentación',
          filas: [
            { campo: 'Radio urbano',        valor: 'Ordenanza Municipal 35/2004 del 16 de abril de 2004, Gobierno Autónomo Municipal de La Guardia · homologada por Resolución Suprema N° 223847 del 25 de agosto de 2005' },
            { campo: 'Urbanización abierta', valor: 'Aprobada por Decreto Municipal N° 35/2022 del 2 de septiembre de 2022' },
            { campo: 'Licencia ambiental',  valor: 'Categoría 3, Gobierno Autónomo Departamental de Santa Cruz, 3 de febrero de 2023 · PPM-PASA 1114/22 N° 013/2023' },
            { campo: 'Por cada lote',       valor: 'Plano de ubicación y uso de suelo, certificado catastral y matrícula registrada en Derechos Reales de Santa Cruz' },
            { campo: 'Contrato de venta',   valor: 'Con reserva de propiedad, aprobado por el Viceministerio de Defensa de los Derechos del Usuario y del Consumidor el 14 de noviembre de 2023' },
            { campo: 'Transferencia',       valor: 'INMOL se hace cargo de la transferencia definitiva sin costo para el comprador: asume el Impuesto a la Transferencia y los aranceles en Derechos Reales y en la Alcaldía de La Guardia' }
          ]
        }
      ],

      plano: {
        etiqueta: 'Disponibilidad',
        prefijo: 'EC',
        // Snapshot real descargado del sistema de INMOL — ver cabecera del
        // archivo. Reemplaza a la disponibilidad de ejemplo.
        disponibilidadReal: DISP_EL_ENCANTO,
        // Plano oficial real (con logo y colores de INMOL), descargado del
        // mismo sistema. imagenAncho/imagenAlto son las dimensiones del
        // plano original; escalaImagen es la escala a la que se descargó
        // assets/planos/el-encanto.jpg (más liviana que el original).
        imagenReal: 'assets/planos/el-encanto.jpg',
        imagenAncho: 7070, imagenAlto: 10000, escalaImagen: 0.5,
        unidad: 'terreno', unidadPlural: 'terrenos'
      }
    },

    /* ===================== 2. CENTRO COMERCIAL LIBERTAD =================== */
    {
      id: 'libertad',
      nombre: 'Centro Comercial Libertad',
      subtitulo: 'Zona Sur · Santa Cruz',
      tipo: 'Centro comercial',
      estadoComercial: 'En comercialización',
      claim: 'Su negocio, en la zona de mayor crecimiento de Santa Cruz.',
      descripcion: 'Ubicado en la zona Sud Este de Santa Cruz de la Sierra, a ' +
                   'sólo 20 minutos del centro, continuando por la Av. Santos ' +
                   'Dumont, prolongación 8vo anillo, zona Plan 4000. Alta ' +
                   'accesibilidad gracias a su conexión directa con avenidas ' +
                   'principales y transporte público (micros #21 y #109). ' +
                   'Rodeado de colegios y áreas urbanizadas, en una de las ' +
                   'zonas de mayor crecimiento comercial y residencial.',

      // Ubicación exacta. Código Plus 57JR4R6G+VC, del enlace de Maps de INMOL.
      coordenadas: { lat: -17.88781, lng: -63.17394 },
      direccion: '8vo anillo y Av. Santos Dumont, Santa Cruz de la Sierra',
      enlaceMapa: 'https://maps.app.goo.gl/56LVGHSEHuBsimVt6',
      recorrido360: 'assets/tour/libertad/index.html',

      semilla: 77310,

      fotos: [
        'assets/medios/libertad/libertad-01.jpg',
        'assets/medios/libertad/libertad-02.jpg',
        'assets/medios/libertad/libertad-03.jpg',
        'assets/medios/libertad/libertad-04.jpg',
        'assets/medios/libertad/libertad-05.jpg'
      ],
      video: 'assets/medios/video/libertad.mp4',

      destacados: [
        { valor: '326',         etiqueta: 'locales comerciales' },
        { valor: '9.584,34 m²', etiqueta: 'superficie de terreno' },
        { valor: 'Zona Sur',    etiqueta: 'Santa Cruz' },
        { valor: '8vo anillo',  etiqueta: 'y Av. Santos Dumont' }
      ],

      // Puntos de referencia reales. Los dos primeros son los "Ingresos" del
      // mapa de accesos oficial de INMOL; el resto se investigó en Google
      // Maps a partir de la ubicación del proyecto (distancia en auto).
      referencias: [
        { nombre: 'Ingreso: Av. Santos Dumont Final',           distancia: '0.1 km', icono: 'via', angulo: 45  },
        { nombre: 'Ingreso: Doble Vía a La Guardia (8vo anillo)', distancia: '0.2 km', icono: 'via', angulo: 200 },
        { nombre: 'Centro Educ. Luz y Verdad', distancia: '2.4 km', icono: 'colegio',  angulo: 228,
          coordenadas: { lat: -17.8762346, lng: -63.1872295 } },
        { nombre: 'Centro de Salud Cortez',   distancia: '1.4 km', icono: 'salud',    angulo: 3,
          coordenadas: { lat: -17.8936097, lng: -63.1736176 } },
        { nombre: 'Mercado Palmira',          distancia: '2.1 km', icono: 'comercio', angulo: 167,
          coordenadas: { lat: -17.8769237, lng: -63.1713592 } },
        { nombre: 'Parque Las Orquídeas',     distancia: '2.1 km', icono: 'plaza',    angulo: 79,
          coordenadas: { lat: -17.8893895, lng: -63.1651538 } }
      ],

      servicios: [
        'Proyecto terminado, listo para entrega', 'Transporte público: micros #21 y #109',
        'Prevención de incendios aprobada por Alcaldía y Bomberos', 'Sistema de alarma e hidrantes',
        'Proyecto eléctrico aprobado por la CRE', 'Certificado HABITESE',
        'Documentación individualizada y en regla', 'Rodeado de colegios y áreas urbanizadas'
      ],

      fichaTecnica: [
        { campo: 'Tipología',           valor: 'Centro comercial' },
        { campo: 'Ubicación',           valor: 'Zona Sudeste, 8vo anillo y Av. Santos Dumont' },
        { campo: 'Ingresos',            valor: 'Av. Santos Dumont Final (≈30 min del centro) · Doble Vía a La Guardia, 8vo anillo (≈32 min)' },
        { campo: 'Terreno',             valor: '9.584,34 m²' },
        { campo: 'Construcción',        valor: '8.531,93 m²' },
        { campo: 'Cubierta',            valor: '6.057,94 m² (326 locales comerciales)' },
        { campo: 'Contra incendios',    valor: 'Alarma, extintores, hidrantes y tanque propio' },
        { campo: 'Certificaciones',     valor: 'HABITESE · proyecto eléctrico aprobado por la CRE' },
        { campo: 'Estado comercial',    valor: 'En comercialización, proyecto terminado' }
      ],

      /* Ficha técnica completa, transcrita de la ficha oficial de INMOL
         (PDF-Fichas-CCL, secciones 1 a 9 de FICHA TÉCNICA más la ficha legal).
         La tabla corta de arriba sigue siendo el resumen que lee el asistente;
         esto es el detalle que el asesor muestra en pantalla.
         Sin precios: es decisión comercial de INMOL no exhibirlos. */
      fichaGrupos: [
        {
          titulo: 'Superficie',
          filas: [
            { campo: 'Terreno',      valor: '9.584,34 m²' },
            { campo: 'Construcción', valor: '8.531,93 m²' },
            { campo: 'Cubierta',     valor: '6.057,94 m² · 326 locales comerciales' }
          ]
        },
        {
          titulo: 'Medida de cada local comercial',
          filas: [
            { campo: 'Planta baja',      valor: '9 m² (3 × 3 medido a eje) · área útil 8,13 m²' },
            { campo: 'Mezanine',         valor: '3,6 m² (3 × 1,20 medido a eje) · área útil 3,42 m², losa de 2,85 × 1,20' },
            { campo: 'Superficie total', valor: '12,6 m² · superficie útil 11,55 m²' },
            { campo: 'Área común',       valor: '10,61 m²' },
            { campo: 'Fracción Ideal de Terreno', valor: '29,29 m² (0,31 %)' }
          ]
        },
        {
          titulo: 'Características de cada local',
          items: [
            'Piso de planta baja de hormigón pulido',
            'Losa del piso del mezanine apoyada en 3 caras a los muros',
            'Muros de ladrillo de 6 huecos, revocado y pintado en blanco',
            'Cerramiento con cortinas arrollables metálicas galvanizadas con ensamble',
            'Altura útil de planta baja: 3,35 m',
            'Altura útil de mezanine: 3,10 m',
            'Altura útil de planta baja a cubierta: 9,00 m',
            'Acceso al mezanine mediante escalera metálica',
            'Pasillos de hormigón pulido: 2,5 m los exteriores y 3 m los internos'
          ]
        },
        {
          titulo: 'Puntos eléctricos y agua por local',
          items: [
            '2 tomacorrientes dobles normales en planta baja',
            '1 interruptor doble en planta baja',
            '2 puntos de iluminación: uno en planta baja y otro en el mezanine',
            '1 tablero de distribución eléctrico en planta baja',
            '2 puntos de acceso con caja de 2” × 4” para TV e internet',
            'Patio de comidas y carnes: agua potable y 1 tomacorriente de fuerza adicional',
            'Sector peluquería: conexión de agua potable'
          ]
        },
        {
          titulo: 'Baños',
          items: [
            'Sectorizados para hombres y mujeres',
            'Baños para personas con discapacidad',
            'Duchas, baterías de inodoros y baterías de urinarios'
          ]
        },
        {
          titulo: 'Iluminación',
          filas: [
            { campo: 'Pasillos e interiores de locales', valor: 'Tubo LED doble de 18 W T8' },
            { campo: 'Baños',                            valor: 'Plafón circular LED de 24 W' },
            { campo: 'Oficina de administración',        valor: 'Plafón cuadrado LED de 24 W' },
            { campo: 'Exteriores',                       valor: 'Luminaria tipo calle LED de 150 W con fotocélula autorregulable' }
          ]
        },
        {
          titulo: 'Energía eléctrica',
          items: [
            'Medidores de energía eléctrica individuales para cada local',
            '2 transformadores de energía exclusivos para el centro comercial',
            'Protección con diferencial eléctrico en cada tablero',
            'Alimentadores desde el tablero principal hasta los locales, en bandejas portacables',
            'Bandeja para alimentadores según la normativa NB 777-2024 vigente',
            'Instalaciones ejecutadas en cumplimiento de la normativa NB 777'
          ]
        },
        {
          titulo: 'Características externas',
          items: [
            'Techo de cubierta sellada mecánicamente, con calamina prensada (no perforada), que garantiza no tener filtraciones de agua',
            'Piso de parqueo de hormigón simple',
            '3 ingresos y salidas vehiculares de 6 m de ancho cada una',
            '1 ingreso y salida de carga y descarga de 5,6 m de ancho',
            '1 ingreso principal peatonal de 14 m de ancho',
            '4 accesos peatonales secundarios de 2,5 m y 1 acceso de 3,18 m',
            'Puente de acceso vehicular',
            'Área de parqueo en todo el contorno'
          ]
        },
        {
          titulo: 'Sistema contra incendios',
          items: [
            'Sistema de alarma con pulsadores manuales y sensores fotoeléctricos',
            'Red de hidrantes internos y externos',
            'Extintores portátiles ABC y CO₂',
            'Aprobado y certificado por las autoridades municipales y personal de bomberos'
          ]
        },
        {
          titulo: 'Aprobaciones y documentación',
          filas: [
            { campo: 'Proyecto aprobado',      valor: 'Resolución Técnica Administrativa DRU N° 0610/2023 del 4 de diciembre de 2023, Gobierno Autónomo Municipal de Santa Cruz de la Sierra' },
            { campo: 'Licencia de construcción', valor: 'Resolución Técnica Administrativa DRU N° 0167/2024' },
            { campo: 'Licencia ambiental',     valor: 'Categoría 3, Gobierno Autónomo Departamental de Santa Cruz, 4 de abril de 2024 · PPM-PASA 147/24 N° 079/2024' },
            { campo: 'Propiedad horizontal',   valor: 'Escritura Pública N° 1066/2024 del 19 de agosto de 2024 · 326 unidades funcionales individualizadas' },
            { campo: 'Certificado de habitabilidad', valor: 'CH-17122025 del 17 de diciembre de 2025' },
            { campo: 'Por cada local',         valor: 'Plano de ubicación y uso de suelo y certificado catastral aprobados' }
          ]
        }
      ],

      plano: {
        // En el centro comercial la sección se llama distinto: no se vende
        // disponibilidad de lotes sino distribución de locales.
        etiqueta: 'Planos y distribución',
        // A pedido de INMOL: acá no se muestra qué está disponible, reservado
        // o vendido — cada local tiene su propio precio, así que sólo
        // interesa la disposición física de las áreas.
        disposicion: true,
        prefijo: 'LB',
        // Numeración real de locales (snapshot del sistema de INMOL), sin
        // mostrar el estado comercial — ver "disposicion" arriba.
        disponibilidadReal: DISP_LIBERTAD,
        imagenReal: 'assets/planos/libertad.jpg',
        imagenAncho: 5500, imagenAlto: 3760, escalaImagen: 0.5,
        unidad: 'local', unidadPlural: 'locales'
      }
    },

    /* ================ 3. URBANIZACIÓN EL ENCANTO 2 (La Guardia) =========== */
    {
      id: 'el-encanto-2',
      nombre: 'Urbanización El Encanto 2',
      subtitulo: 'La Guardia · Santa Cruz',
      tipo: 'Urbanización residencial',
      estadoComercial: 'En comercialización',
      // Todavía faltan fotos, video y la ubicación exacta confirmada por
      // INMOL — se avisa en la tarjeta del menú para no generar expectativas.
      pendiente: true,
      claim: 'La segunda etapa de El Encanto, sobre la carretera a Camiri.',
      descripcion: 'Estratégicamente ubicada a la altura del Km 13 de la Doble ' +
                   'Vía La Guardia, ingresando tan solo 5 km sobre la carretera ' +
                   'a Camiri, en zona consolidada con vías de acceso pavimentadas, ' +
                   'colegios, centros de salud y mercados en sus alrededores.',

      // NOTA: INMOL todavía no entregó el pin exacto de Google Maps (el
      // propio documento de datos lo marca "en proceso de habilitar").
      // Esta coordenada es una estimación a partir de los puntos de
      // referencia de su mapa oficial (Módulo Educativo José Villarroel
      // Robles y Centro Médico Salud ADvenir, los más cercanos al predio) —
      // hay que reemplazarla apenas INMOL confirme la ubicación registrada.
      coordenadas: { lat: -17.9050, lng: -63.2601 },
      direccion: 'Km 13 Doble Vía La Guardia, sobre carretera a Camiri, Santa Cruz',
      enlaceMapa: '',
      recorrido360: '',

      semilla: 63204,

      // Todavía no hay fotos ni video propios de este proyecto; el panel
      // cae automáticamente a la vista satelital generada.
      fotos: [],
      video: '',

      destacados: [
        { valor: '249',                  etiqueta: 'terrenos' },
        { valor: '300 – 29.128 m²',      etiqueta: 'superficie de terrenos' },
        { valor: '25 ha',                etiqueta: 'superficie total' },
        { valor: 'Km 13',                etiqueta: 'Doble Vía La Guardia' }
      ],

      // Puntos de referencia del mapa oficial de INMOL para este proyecto,
      // ubicados en Google Maps (distancia en auto).
      referencias: [
        { nombre: 'Cruce Km 13 Doble Vía La Guardia', distancia: '4.3 km', icono: 'via', angulo: 197,
          coordenadas: { lat: -17.8680828, lng: -63.2721053 } },
        { nombre: 'Módulo Educ. José Villarroel Robles', distancia: '0.3 km', icono: 'colegio', angulo: 249,
          coordenadas: { lat: -17.9040467, lng: -63.2627157 } },
        { nombre: 'Centro Médico Salud ADvenir', distancia: '1.0 km', icono: 'salud', angulo: 16,
          coordenadas: { lat: -17.9139666, lng: -63.2574233 } },
        { nombre: 'Hipermaxi Mi Barrio', distancia: '4.3 km', icono: 'comercio', angulo: 197,
          coordenadas: { lat: -17.8680828, lng: -63.2721053 } }
      ],

      servicios: [
        'Ingreso principal pavimentado, directo desde la carretera a Camiri',
        'Educación cercana: acceso fácil a colegios', 'Salud a pocos minutos',
        'Mercados y transporte público', 'Luz, agua, gas e internet de fácil acceso',
        'Áreas verdes bien ubicadas', 'Área de equipamiento amplio'
      ],

      fichaTecnica: [
        { campo: 'Tipología',            valor: 'Urbanización abierta' },
        { campo: 'Ubicación',            valor: 'La Guardia, Km 13 · 5 km sobre carretera a Camiri' },
        { campo: 'Superficie total',     valor: '25 hectáreas' },
        { campo: 'Cantidad de terrenos', valor: '249' },
        { campo: 'Superficie de terrenos', valor: '300 m² a 29.128 m²' },
        { campo: 'Ingreso',              valor: 'Pavimentado, directo desde la carretera a Camiri' },
        { campo: 'Servicios básicos',    valor: 'Luz, agua, gas e internet' },
        { campo: 'Estado comercial',     valor: 'En comercialización' }
      ],

      plano: {
        etiqueta: 'Disponibilidad',
        prefijo: 'EC2',
        disponibilidadReal: DISP_EL_ENCANTO_2,
        imagenReal: 'assets/planos/el-encanto-2.jpg',
        imagenAncho: 5000, imagenAlto: 7411, escalaImagen: 0.5,
        unidad: 'terreno', unidadPlural: 'terrenos'
      }
    }
  ]
};
