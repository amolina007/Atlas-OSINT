# Reviewed territorial overlays (dev)

These are **georeferenced polygons**, not linked reference images, live fronts,
claims of sovereign borders, or areas inferred from incident/news points.

| Layer | Territorial date | File revision | Provenance |
|---|---|---|---|
| Gaza | 2026-04-28 | 2026-05-15 (fixes) | Ecrusized, Veggies and Commons contributors; CC BY-SA 4.0 |
| Sudan | 2026-10-03 | 2026-10-03 | ElijahPepe, BorysMapping and Commons contributors; CC BY-SA 4.0; base NordNordWest CC BY-SA 3.0 DE |
| Kivu, DR Congo | 2025-04-03 | 2025-05-16 | Vertcarmin; CC0 1.0 |

Kivu is **historical**. Gaza is also a dated snapshot, not the current front.
Commons is community cartography: attribution and traceability do not make its
assessments independently confirmed. Source links, dates, licenses and this
limitation must remain visible. Do not substitute upload/check time for data time.

## Conversion

`manifest.json` pins the exact publicly downloadable SVG hash and selected
paths, dates, meanings, coefficients and licenses. The source SVG is parsed as
vector data only; embedded images/scripts are never run. Output is EPSG:4326.
Bezier curves are sampled, invalid rings repaired, small coordinates snapped and
polygons simplified. The maps' explicit overpainted classifications are flattened
(SAF in Sudan; FARDC in Kivu), not inferred from unrelated national boundaries.
Gaza has two separately published colored paths; neither side is invented by
subtracting the other from an administrative boundary.

- **Sudan:** source base publishes equirectangular extent 21.5–39 E, 8.4–23.3 N,
  width 1653.539 and height 1450.109. SVG viewBox offset is resolved by svgelements.
  Source is national overview cartography with approximate boundaries and
  generalized settlement symbols; it is not suitable for precise local fronts.
- **Gaza:** affine fit of four corresponding extremal border corners against
  UNICEF's public GazaMunicipalities boundary; max fit residual 0.6 km. Only the
  boundary was used, never warehouse/route/operational-zone data. No control
  classification is taken from UNICEF. Geometry is not clipped/extended to invent
  coverage. Public boundary endpoint:
  https://services3.arcgis.com/7J7WB6yJX0pYke9q/ArcGIS/rest/services/UNICEF_Gaza_Warehouse_Map_2026_WFL1/FeatureServer/9
- **Kivu:** affine fit using SVG city symbols and GeoNames coordinates returned
  by the Open-Meteo geocoder. Goma (3439.97,3055.72 → 29.22845,-1.67409), Bukavu
  (2970.42,4104.90 → 28.84281,-2.49077), Butembo (3511.47,725.94 →
  29.29117,0.14164), Beni (3730.94,273.02 → 29.47306,0.49113), Uvira
  (3308.95,5255.15 → 29.13779,-3.39534). Max fit residual <1 km. Clip to original
  map frame. Separate categories for Ugandan, Burundian and Wazalendo **presence**,
  which do not establish exclusive control. This is not coverage of all DR Congo.

Fit residuals measure registration, **not** confidence in the author's front.
Areas without classification stay unassigned. Sudan's green area absent from the
published legend is UNKNOWN; do not guess its actor.

Reproduce after installing `requirements.txt`:

```sh
python3 scripts/import-reviewed-territories.py /directory/with/reviewed/svg/files
node --test tests/conflicts.test.mjs tests/territory-layers.test.mjs tests/map-explorer.test.mjs
```

Expected inputs are `control-gaza.svg`, `control-sudan.svg`, `control-congo.svg`.
Each download URL is in the manifest. A changed SHA-256 fails closed and preserves
the existing file; a new source version needs date, semantics and geometry review.
Browser refreshes preserve the last valid snapshot on failure and ignore responses
from previously selected conflicts. The existing Ukraine automated update is
unchanged. **No automatic territorial date advancement is claimed for these three
reviewed snapshots.**

## Other candidates examined, not imported

- CTP/AEI September 25, 2026 eastern DRC map: item
  `cb4e6cdddcdf4b3483d9124538abf702`; metadata requires written reuse consent.
  No CTP shapefile/tile geometry was copied or access restrictions bypassed.
- UNICEF DSS Gaza Operational Zones: coordination/access zones, not a bando
  classification; excluded as a control source.
- War Mapper's public Sudan feature services were from 2023; not represented as
  current data. Linked reference maps remain secondary context only.

## Revisión de vigencia — 8 de noviembre de 2026

La descarga y la revisión no cambian el corte de observación. Atlas considera
recientes únicamente cortes de hasta siete días (criterio editorial, no garantía
de exactitud). Las demás geometrías se conservan como archivo y requieren activar
«Ver capa histórica»; ese consentimiento se reinicia al cambiar de conflicto.
Una actualización fallida no permite presentar el archivo como actual.

La búsqueda de nuevas geometrías revisó:
- MONUSCO, S/2026/208, mapa de presencia estimada al 1 de marzo de 2026:
  https://monusco.unmissions.org/sites/default/files/2026-04/Report%20of%20the%20Secretary%20general%20S%202026%20208-n2605066.pdf
  No es una delimitación actual de control exclusivo.
- Critical Threats, Congo War Security Review, corte 28 de octubre de 2026:
  https://www.criticalthreats.org/briefs/congo-war-security-review
  Informe reciente; no se obtuvieron polígonos reutilizables verificados. No se
  transfirió la fecha del informe a los límites del archivo de abril de 2025.
- https://github.com/forensic-architecture/gaza-public-data : los archivos públicos
  de Spatial Control llevan corte 250118; no justifican actualizar a 2026.
- https://adulisreview.org/map/ : reportes y áreas generalizadas; no se adoptaron
  divisiones administrativas o afirmaciones de localidades como líneas de frente.

No se encontraron en esta revisión nuevos polígonos de control que cumplieran
simultáneamente vigencia, procedencia y reutilización verificables para Congo,
Gaza o Sudán. Se conserva su corte original, sin afirmar que estén actualizados.
