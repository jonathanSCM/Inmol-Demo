/* ============================================================================
   INMOL · Panel interactivo
   probar-clics.js — Verifica con CLICS REALES que toda la pantalla responda
   ----------------------------------------------------------------------------
   Abre el panel en un Chrome de verdad y hace clic en 36 puntos repartidos por
   toda la superficie, en las tres tarjetas, en las pestañas, en un lote, en los
   filtros y en los niveles satelitales.

   SÓLO PARA DESARROLLO. El panel de feria no necesita nada de esto: se abre
   con doble clic y no tiene dependencias.

   Uso:
     npm install puppeteer-core
     node herramientas/probar-clics.js
     node herramientas/probar-clics.js "http://localhost:5173/index.html"
   ============================================================================ */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORDEFECTO = 'file:///' +
  path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const URL = process.argv[2] || PORDEFECTO;

/* Resolución a probar. Horizontal por defecto; para el tótem vertical:
   node herramientas/probar-clics.js "" 1080 1920                          */
const ANCHO = parseInt(process.argv[3], 10) || 1920;
const ALTO  = parseInt(process.argv[4], 10) || 1080;

(async () => {
  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [`--window-size=${ANCHO},${ALTO}`, '--disable-gpu', '--force-device-scale-factor=1']
  });
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: ANCHO, height: ALTO });
  await pagina.setCacheEnabled(false);

  const errores = [];
  pagina.on('pageerror', e => errores.push('JS: ' + e.message));
  pagina.on('console', m => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });

  console.log(`Probando ${ANCHO}x${ALTO}: ${URL}\n`);
  await pagina.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const estado = () => pagina.evaluate(() => ({
    pantalla: Estado.pantalla,
    proyecto: Estado.proyecto ? Estado.proyecto.nombre : null,
    seccion: Estado.seccion,
    lote: Estado.loteSel ? Estado.loteSel.codigo : null,
    filtro: Estado.filtro,
    nivel: Estado.nivelSat
  }));
  const ir = p => pagina.evaluate(x => irA(x), p);
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  const resultados = [];
  const ok = (n, c) => resultados.push((c ? '  OK  ' : ' FALLA ') + n);

  /* 1. Toda la superficie de la atracción debe abrir el menú */
  const puntos = [];
  for (const fy of [0.02, 0.2, 0.4, 0.6, 0.8, 0.98])
    for (const fx of [0.02, 0.2, 0.4, 0.6, 0.8, 0.98])
      puntos.push([Math.round(ANCHO * fx), Math.round(ALTO * fy)]);

  const fallidos = [];
  for (const [x, y] of puntos) {
    await ir('atraccion'); await esperar(90);
    await pagina.mouse.click(x, y); await esperar(140);
    if ((await estado()).pantalla !== 'menu') fallidos.push(`(${x},${y})`);
  }
  ok(`Atracción: ${puntos.length - fallidos.length}/${puntos.length} puntos abren el menú` +
     (fallidos.length ? ' — fallan ' + fallidos.join(' ') : ''), fallidos.length === 0);

  /* 2. Las tres tarjetas: cuerpo y flecha */
  for (let i = 0; i < 3; i++) {
    for (const [sel, nombre] of [['.tj-flecha', 'flecha'], ['.tarjeta', 'cuerpo']]) {
      await ir('menu');
      await pagina.evaluate(() => { Estado.proyecto = null; });
      await esperar(120);
      const c = await pagina.evaluate((s, idx) => {
        const r = document.querySelectorAll(s)[idx].getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }, sel, i);
      await pagina.mouse.click(c.x, c.y); await esperar(300);
      const e = await estado();
      ok(`Tarjeta ${i + 1} (${nombre}) → ${e.proyecto || 'NADA'}`,
         e.pantalla === 'proyecto' && !!e.proyecto);
    }
  }

  /* 3. Dentro del proyecto */
  const clicSel = async (sel, idx) => {
    const c = await pagina.evaluate((s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    }, sel, idx);
    if (!c) return false;
    await pagina.mouse.click(c.x, c.y);
    return true;
  };

  const esperadas = ['resumen', 'ubicacion', 'lotes', 'ficha'];
  for (let i = 0; i < esperadas.length; i++) {
    await clicSel('.tab', i); await esperar(280);
    const e = await estado();
    ok(`Pestaña ${i + 1} → ${e.seccion}`, e.seccion === esperadas[i]);
  }

  await clicSel('.tab', 2); await esperar(300);
  await clicSel('.plano-svg .lote', 25); await esperar(220);
  let e = await estado();
  ok(`Clic en un lote → ${e.lote || 'NADA'}`, !!e.lote);

  await clicSel('.filtro', 1); await esperar(220);
  e = await estado();
  ok(`Filtro «sólo disponibles» → ${e.filtro}`, e.filtro === 'disponible');

  /* Ubicación: con internet se usa el mapa real; sin internet, la vista
     satelital generada. Se comprueba el que esté activo. */
  await clicSel('.tab', 1); await esperar(900);
  const conMapaReal = await pagina.evaluate(() => !!Estado.usaMapaReal);

  if (conMapaReal) {
    const mapa = await pagina.evaluate(() => ({
      pines: document.querySelectorAll('.pin-ref').length,
      proyecto: document.querySelectorAll('.pin-proyecto').length,
      teselas: document.querySelectorAll('.leaflet-tile-loaded').length
    }));
    ok(`Mapa real activo · ${mapa.teselas} teselas cargadas`, mapa.teselas > 0);
    ok(`Pin del proyecto y ${mapa.pines} pines de referencia`,
       mapa.proyecto === 1 && mapa.pines >= 3);

    await clicSel('#btnAcercar', 0); await esperar(2600);
    const z1 = await pagina.evaluate(() => MapaReal.mapa.getZoom());
    ok(`«Acercar al proyecto» → zoom ${z1}`, z1 >= 16);

    await clicSel('#btnVerTodo', 0); await esperar(1200);
    const z2 = await pagina.evaluate(() => MapaReal.mapa.getZoom());
    ok(`«Ver todo» encuadra las referencias → zoom ${z2}`, z2 < z1);
  } else {
    await clicSel('.sat-nivel', 3); await esperar(320);
    e = await estado();
    ok(`Sin internet · nivel satelital «Predio» → nivel ${e.nivel}`, e.nivel === 3);
    await clicSel('#btnSobrevuelo', 0); await esperar(400);
    ok('Sin internet · «Sobrevuelo automático» responde',
       await pagina.evaluate(() => Estado.sobrevolando));
  }

  /* 4. El contenido usa todo el ancho: no debe quedar franja muerta */
  await esperar(6000);
  const aprovechado = await pagina.evaluate(() => {
    const p = document.querySelector('.pane.activa').getBoundingClientRect();
    return {
      ancho: Math.round(p.width), alto: Math.round(p.height),
      pctAncho: Math.round(p.width / innerWidth * 100),
      pctAlto: Math.round(p.height / innerHeight * 100)
    };
  });
  ok(`El contenido ocupa ${aprovechado.pctAncho}% del ancho y ${aprovechado.pctAlto}% del alto`,
     aprovechado.pctAncho >= 90);

  await clicSel('#btnVolver', 0); await esperar(400);
  e = await estado();
  ok(`Botón «Proyectos» vuelve al menú → ${e.pantalla}`, e.pantalla === 'menu');

  console.log(resultados.join('\n'));
  console.log('\nErrores de JavaScript: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  const fallas = resultados.filter(r => r.startsWith(' FALLA')).length;
  console.log(fallas === 0 ? '\nTODO CORRECTO' : `\n${fallas} PRUEBAS FALLIDAS`);

  await navegador.close();
  process.exit(fallas === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(2); });
