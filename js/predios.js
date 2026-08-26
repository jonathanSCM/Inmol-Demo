/* Contorno del terreno de cada proyecto, sombreado sobre el mapa satelital.

   EL ENCANTO: trazado por ProShop sobre la foto satelital con
   herramientas/trazar-predio.html, siguiendo el perímetro real del loteo.
   Da 61,24 ha contra las 64,58 que declara INMOL: 5% de diferencia, dentro de
   lo esperable para un trazo sobre imagen.

   EL ENCANTO 2: deducido de los 249 lotes cargados en el sistema de INMOL —su
   envolvente, escalada a las 25 ha declaradas y centrada en las coordenadas
   del proyecto—. Al ser una envolvente convexa, los entrantes del terreno
   quedan suavizados. Conviene repasarlo con el trazador cuando haya tiempo.

   NINGUNO ES UN PLANO CATASTRAL. Sirven para que el cliente vea de un vistazo
   qué superficie ocupa el proyecto, no para discutir un límite de propiedad.

   PARA CORREGIRLOS: abrir herramientas/trazar-predio.html; carga solo lo que
   esté guardado, se ajusta y se vuelve a copiar.

   El centro comercial no lleva contorno: sus 326 unidades son locales dentro
   del edificio, así que su envolvente sería el galpón, no el terreno. */
const PREDIOS = {"el-encanto":[{"nombre":"Urbanización El Encanto","puntos":[[-17.902935,-63.303223],[-17.902057,-63.303158],[-17.90149,-63.300171],[-17.901477,-63.300084],[-17.901301,-63.297172],[-17.90222,-63.296871],[-17.902384,-63.298888],[-17.904732,-63.298244],[-17.904446,-63.295991],[-17.907651,-63.294747],[-17.909959,-63.293309],[-17.911278,-63.292211],[-17.911444,-63.293727],[-17.911531,-63.294535],[-17.911652,-63.295783],[-17.911837,-63.299425],[-17.905426,-63.300133],[-17.905426,-63.301013],[-17.903282,-63.301206],[-17.9032,-63.302279],[-17.903241,-63.302794],[-17.902935,-63.303223]]}],"el-encanto-2":[{"nombre":"Urbanización El Encanto 2","puntos":[[-17.902668,-63.262937],[-17.902027,-63.262603],[-17.90157,-63.261662],[-17.901366,-63.261229],[-17.901359,-63.260186],[-17.902604,-63.259133],[-17.904195,-63.258555],[-17.906183,-63.258442],[-17.908114,-63.258442],[-17.908413,-63.25846],[-17.909519,-63.258573],[-17.910247,-63.258715],[-17.908762,-63.259678],[-17.902972,-63.262784],[-17.902668,-63.262937]]}]};
