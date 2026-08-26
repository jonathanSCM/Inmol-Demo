/* Contorno del terreno de cada proyecto, sombreado sobre el mapa satelital.
   GENERADO con herramientas/trazar-predio.html, botón «Generar de los lotes».

   CÓMO SE OBTUVO — y qué tan fiable es
   Es la envolvente de los lotes que INMOL tiene cargados en su sistema (1.101
   en El Encanto, 249 en El Encanto 2), escalada para que su superficie dé
   exactamente la que INMOL declara, y centrada en las coordenadas del
   proyecto. O sea: la forma, el tamaño y la posición salen de datos de INMOL,
   no de mirar la foto satelital.

   LO QUE NO ES: un plano catastral. La envolvente es convexa, así que los
   entrantes del terreno quedan suavizados, y la orientación se asume norte
   arriba. Sirve para que el cliente vea de un vistazo qué superficie ocupa el
   proyecto; no para discutir un límite de propiedad.

   PARA AFINARLO: abrir herramientas/trazar-predio.html, mover los vértices
   sobre la foto y volver a copiar. El contorno guardado se carga solo.

   El centro comercial no lleva contorno: sus 326 unidades son locales dentro
   del edificio, así que su envolvente sería el galpón, no el terreno. */
const PREDIOS = {"el-encanto":[{"nombre":"Urbanización El Encanto","puntos":[[-17.901592,-63.299584],[-17.901376,-63.299554],[-17.900025,-63.299234],[-17.899979,-63.298991],[-17.899966,-63.298904],[-17.899833,-63.297964],[-17.899885,-63.297731],[-17.902047,-63.294717],[-17.906997,-63.292128],[-17.907614,-63.291838],[-17.908238,-63.291556],[-17.908631,-63.291388],[-17.909049,-63.29122],[-17.909767,-63.291031],[-17.909933,-63.292547],[-17.91002,-63.293355],[-17.910141,-63.294603],[-17.91031,-63.29749],[-17.909846,-63.29772],[-17.902876,-63.29941],[-17.901707,-63.299573],[-17.901592,-63.299584]]}],"el-encanto-2":[{"nombre":"Urbanización El Encanto 2","puntos":[[-17.902668,-63.262937],[-17.902027,-63.262603],[-17.90157,-63.261662],[-17.901366,-63.261229],[-17.901359,-63.260186],[-17.902604,-63.259133],[-17.904195,-63.258555],[-17.906183,-63.258442],[-17.908114,-63.258442],[-17.908413,-63.25846],[-17.909519,-63.258573],[-17.910247,-63.258715],[-17.908762,-63.259678],[-17.902972,-63.262784],[-17.902668,-63.262937]]}]};
