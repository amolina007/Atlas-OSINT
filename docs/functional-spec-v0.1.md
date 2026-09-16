# ATLAS OSINT — Especificación funcional del MVP

**Versión:** 0.1  
**Fecha:** 16 de septiembre de 2026  
**Estado:** Propuesta para revisión previa a implementación  
**Conflicto piloto:** Guerra ruso-ucraniana

## 1. Propósito

ATLAS OSINT representa el mundo contemporáneo como una partida estratégica persistente inspirada en el lenguaje visual de los juegos 4X, manteniendo un estándar verificable de inteligencia de fuentes abiertas.

El sistema no permite «jugar» con conflictos reales ni asigna puntuaciones por víctimas o destrucción. El usuario observa turnos, territorios, actores, capacidades, relaciones y cambios documentados. Toda afirmación publicada debe conservar trazabilidad hacia sus fuentes y evaluaciones.

## 2. Principios obligatorios

1. Una noticia no equivale a un hecho.
2. La unidad analítica principal es la **afirmación**.
3. Las fuentes se atribuyen; no se asumen verdaderas.
4. La confianza se asigna a cada afirmación, no al documento completo.
5. Los datos originales nunca se sobrescriben silenciosamente.
6. Toda corrección conserva historial.
7. Hechos, observaciones, inferencias e hipótesis deben distinguirse.
8. El público solo accede a información revisada y publicada.
9. Las ubicaciones operacionalmente sensibles deben generalizarse o retrasarse.
10. La IA clasifica, relaciona y redacta borradores; la publicación de alto impacto requiere revisión humana.

## 3. Definiciones

| Concepto | Definición operacional |
|---|---|
| Fuente | Entidad que publica información: organismo, medio, investigador, cuenta o base de datos. |
| Documento | Unidad capturada: artículo, comunicado, video, imagen, publicación o registro API. |
| Afirmación | Proposición verificable extraída de uno o más documentos. |
| Evidencia | Relación entre un documento y una afirmación: apoya, contradice, contextualiza o duplica. |
| Evento | Construcción analítica que agrupa afirmaciones sobre un mismo acontecimiento. |
| Evaluación | Juicio fechado sobre confianza, evidencia, contradicciones y razonamiento. |
| Turno | Periodo de observación; inicialmente un día UTC. |
| Territorio | Área geográfica cuyo control o condición se registra temporalmente. |
| Niebla de guerra | Representación visible de incertidumbre, ausencia o contradicción informativa. |

## 4. Alcance del MVP

### Incluye

- Rusia, Ucrania y actores externos directamente relacionados.
- Eventos militares, diplomáticos, económicos, logísticos y humanitarios.
- Cronología diaria.
- Control territorial con vigencia temporal.
- Mapa de eventos publicados.
- Fuentes y enlaces públicos.
- Evaluaciones de confianza.
- Contradicciones y correcciones.
- Resumen diario del turno.
- Alertas preparadas para revisión.

### No incluye en v0.1

- Predicción automática de victorias.
- Seguimiento táctico en tiempo real.
- Ubicación individual de soldados.
- Reconocimiento facial.
- Identificación de víctimas privadas.
- Scraping que infrinja condiciones de servicio.
- Publicación automática de acusaciones de crímenes de guerra.
- Puntuaciones únicas de «poder nacional» o «probabilidad de verdad».

## 5. Usuarios y permisos

| Rol | Capacidades |
|---|---|
| Público | Consultar turnos, eventos, actores y fuentes ya publicados. |
| Analista | Crear documentos, afirmaciones, eventos y evaluaciones en borrador. |
| Revisor | Aprobar, rechazar, retractar y publicar. |
| Administrador | Gestionar usuarios, taxonomías, integraciones y seguridad. |
| Servicio | Ingestar fuentes mediante funciones del servidor. |

En el MVP, las operaciones privadas se ejecutan desde servidor o Edge Functions. La clave secreta o `service_role` nunca se entrega al navegador.

## 6. Flujo de inteligencia

1. **Captura:** API, RSS o incorporación manual.
2. **Archivo:** URL, autor, fechas, idioma, hash y ruta privada.
3. **Normalización:** actores, lugares, tiempo y duplicados.
4. **Extracción:** afirmaciones atómicas.
5. **Corroboración:** relaciones de apoyo o contradicción.
6. **Verificación:** geolocalización, cronolocalización y coherencia física.
7. **Evaluación:** confianza y razonamiento.
8. **Revisión:** decisión humana de publicación.
9. **Publicación:** copia sanitizada hacia el esquema API.
10. **Corrección:** nueva versión o retractación trazable.

## 7. Confianza

| Nivel | Uso |
|---|---|
| Confirmada | Evidencia física concluyente o corroboración independiente sólida. |
| Muy probable | Evidencia fuerte con un vacío menor. |
| Probable | La explicación tiene más respaldo que sus alternativas. |
| Posible | Plausible, pero insuficientemente corroborada. |
| No corroborada | Solo existe una afirmación atribuida. |
| Refutada | Evidencia posterior demuestra que la afirmación era incorrecta. |
| Indeterminada | Evidencia insuficiente o contradictoria. |

Las evaluaciones deben registrar por separado:

- fiabilidad de las fuentes;
- independencia de las corroboraciones;
- precisión temporal;
- precisión geográfica;
- fuerza de la evidencia;
- contradicciones pendientes;
- explicación alternativa principal.

## 8. Niebla de guerra

| Estado visual | Significado |
|---|---|
| Visible | Información confirmada y publicable. |
| Neblina ligera | Muy probable o probable. |
| Neblina densa | Posible o no corroborada. |
| Zona contradictoria | Afirmaciones incompatibles relevantes. |
| Oculta | Información insuficiente o protegida. |
| Refutada | Afirmación desacreditada conservada en el historial. |

## 9. Turnos

El turno inicial corresponde a un día UTC. Un turno contiene:

- resumen ejecutivo;
- cambios desde el turno anterior;
- eventos destacados;
- cambios territoriales;
- actividad aérea y ataques profundos;
- diplomacia;
- situación humanitaria;
- afirmaciones pendientes;
- correcciones;
- evaluación de iniciativa por frente, expresada cualitativamente y con evidencia.

Estados del turno: `draft`, `review`, `published`, `superseded`.

## 10. Eventos

Tipos iniciales:

- batalla o combate terrestre;
- ataque aéreo, misilístico o con drones;
- cambio de control territorial;
- movimiento o despliegue;
- ataque logístico;
- incidente marítimo;
- incidente nuclear;
- decisión diplomática;
- sanción o medida económica;
- negociación o cese del fuego;
- afectación humanitaria;
- operación informacional;
- otro.

Todo evento publicado debe incluir al menos:

- título y resumen neutrales;
- conflicto;
- ventana temporal;
- ubicación con precisión declarada;
- uno o más actores cuando sea posible;
- confianza;
- al menos una afirmación evaluada;
- al menos una fuente pública;
- fecha de revisión;
- política de sensibilidad aplicada.

## 11. Territorios

El sistema no sobrescribe el controlador de un área. Registra intervalos temporales:

- territorio;
- controlador reclamado o evaluado;
- fecha de inicio y fin de vigencia;
- geometría;
- confianza;
- afirmaciones de respaldo.

Las fronteras internacionales reconocidas, las líneas de control evaluadas y los reclamos políticos deben ser capas distintas.

## 12. Modelo estratégico inspirado en Humankind

| Mecánica visual | Variable analítica |
|---|---|
| Turno | Día o semana observada |
| Territorio | Estado, región o zona disputada |
| Influencia | Capacidad diplomática, cultural e informacional |
| Estabilidad | Cohesión institucional y conflictividad interna |
| Industria | Producción, energía y logística |
| Ciencia | Desarrollo tecnológico e innovación |
| Apoyo bélico | Capacidad política y social de sostener la guerra |
| Agravios | Disputas, sanciones y reclamaciones documentadas |
| Unidades | Capacidades o formaciones verificadas y generalizadas |
| Niebla de guerra | Incertidumbre de la información |

Estas variables no reciben una cifra arbitraria en el MVP. Se presentan mediante indicadores documentados, tendencias y explicaciones.

## 13. Productos

### Mapa estratégico

- selector de turno;
- filtros por tipo de evento y confianza;
- capas territoriales;
- niebla de guerra;
- panel de actor, región o evento;
- enlaces hacia evidencia pública.

### Alerta

Se prepara ante:

- cambio territorial verificado;
- entrada de un actor;
- ataque estratégico excepcional;
- incidente nuclear;
- movilización significativa;
- negociación o ruptura diplomática relevante;
- corrección sustantiva de información previamente publicada.

### Boletín diario

- hechos confirmados;
- cambios desde el último turno;
- afirmaciones pendientes;
- situación por frente;
- ataques profundos;
- diplomacia;
- consecuencias humanitarias.

### Informe semanal

- tendencias;
- iniciativa y logística;
- objetivos aparentes;
- explicaciones rivales;
- escenarios de corto plazo;
- indicadores de confirmación o refutación.

## 14. Arquitectura Supabase

### Esquema `osint`

Datos privados de ingestión y análisis. No se expone directamente a la Data API pública.

- fuentes;
- documentos;
- afirmaciones;
- evidencia;
- evaluaciones;
- contradicciones;
- eventos y relaciones;
- territorios temporales;
- turnos;
- auditoría.

### Esquema `api`

Copias sanitizadas destinadas al sitio público:

- conflictos;
- actores;
- eventos;
- turnos;
- enlaces de fuentes.

Solo concede `SELECT` a `anon` y `authenticated`. Las operaciones de escritura se reservan al servidor.

### Storage

- `raw-evidence`: privado; documentos originales y capturas autorizadas.
- `public-assets`: público; mapas simplificados, miniaturas y materiales con licencia compatible.

La creación de buckets y políticas se deja para una migración posterior, después de definir retención, derechos de autor y límites de tamaño.

## 15. Automatización por fases

### Fase 1 — Manual asistida

- ingreso manual de fuentes;
- extracción asistida de afirmaciones;
- verificación y publicación humana;
- primer turno Rusia–Ucrania.

### Fase 2 — Ingesta estructurada

- ReliefWeb;
- ACLED, sujeto a credenciales y licencia;
- GDELT para detección de señales;
- NASA FIRMS;
- RSS institucionales.

### Fase 3 — Detección y alertas

- deduplicación;
- agrupación por posible evento;
- detección de contradicciones;
- alertas preparadas para revisión;
- comparación entre turnos.

## 16. Criterios de aceptación del MVP

1. Ningún registro privado puede obtenerse con la clave pública.
2. El sitio público solo lee tablas del esquema `api`.
3. Cada evento publicado presenta al menos una fuente enlazada.
4. Toda afirmación mantiene su historial de evaluación.
5. Las correcciones no eliminan el registro anterior.
6. El mapa diferencia control territorial, reclamo e incertidumbre.
7. Las ubicaciones sensibles pueden reducir su precisión.
8. Un turno publicado puede reconstruirse posteriormente.
9. Las claves secretas permanecen en servidor.
10. La auditoría de seguridad no reporta exposición involuntaria.

## 17. Decisiones pendientes antes de implementar

1. Nombre definitivo del producto.
2. Uso público, privado o híbrido durante el piloto.
3. Frecuencia real del turno: diaria o semanal.
4. Primera lista de fuentes autorizadas.
5. Política de archivo de material protegido por derechos de autor.
6. Retraso mínimo para ubicaciones militares sensibles.
7. Responsable humano de aprobar cada publicación.
8. Frontend: sitio estático progresivo o aplicación React/Next.

## 18. Próximo incremento

Después de aprobar esta versión:

1. crear el proyecto Supabase separado;
2. ejecutar el esquema en un entorno de prueba;
3. correr asesores de seguridad y rendimiento;
4. insertar un conjunto mínimo de datos Rusia–Ucrania;
5. comprobar accesos anónimo, autenticado y servidor;
6. construir una interfaz interna de revisión;
7. publicar el primer turno únicamente después de verificar la trazabilidad completa.
