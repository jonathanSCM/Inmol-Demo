/* Contorno del terreno de cada proyecto, para sombrearlo sobre el mapa
   satelital igual que en los planos comerciales de INMOL.

   ESTÁ VACÍO A PROPÓSITO.
   No existe una fuente fiable del límite de estos predios: el plano de lotes
   está en píxeles (no georreferenciado) y OpenStreetMap no tiene mapeada
   ninguna de las tres urbanizaciones. Dibujar el contorno a ojo sobre la foto
   satelital sería inventar el límite de una propiedad que se le muestra a un
   comprador, así que se deja vacío hasta tener el trazo real.

   PARA LLENARLO
     1. Entrar a https://www.google.com/maps/d/ y crear un mapa.
     2. Herramienta «Dibujar una línea» → «Agregar polígono»: marcar el
        perímetro del terreno sobre la vista satelital y cerrarlo.
     3. Exportar a KML (marcando «Exportar como KML en lugar de KMZ»),
        guardarlo con el id del proyecto: el-encanto.kml
     4. node herramientas/importar-rutas.js el-encanto.kml

   La herramienta informa la superficie en hectáreas del polígono: conviene
   contrastarla con la que declara INMOL antes de darla por buena. */
const PREDIOS = {};
