# Revisión de Pulso económico · 15 noviembre 2026

Solo dev. Snapshot del endpoint real en tests/fixtures/economy (últimas 60 observaciones como máximo, metadatos y fechas originales). No son datos usados por la aplicación.

## Contraste con publicaciones oficiales

- Dólar: 992,48 CLP/USD, 13 noviembre. Serie anual del Banco Central, accedida desde https://si3.bcentral.cl/Indicadoressiete/secure/IndicadoresDiarios.aspx → Dólar → Ver serie. La tabla SII consultada aún no tenía el día 13; no se utilizó esa ausencia como cero ni como contradicción del Banco Central.
- UF: 41.336,67 CLP, 15 noviembre: https://www.sii.cl/valores_y_fechas/uf/uf2026.htm . Se excluyen valores publicados para fechas futuras.
- IPC: 0,5% mensual y 4,5% a doce meses, octubre: https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor . Boletín publicado el 6 noviembre.
- TPM: 4,5%, referencia del proveedor 13 noviembre. Comunicado oficial del 27 octubre confirma mantenimiento: https://www.bcentral.cl/web/banco-central/contenido/-/detalle/prensa/comunicados-rpm/comunicado-reunion-de-politica-monetaria-octubre-2026 . El proveedor registra último cambio el 17 diciembre 2025; no representa última reunión.
- Cobre: 6,30 USD/libra, 13 noviembre. Serie anual del Banco Central accesible desde indicadores diarios → Libra de cobre → Ver serie.
- Imacec: +0,2% anual en septiembre: https://www.bcentral.cl/en/web/banco-central/area/statistics/imacec . Dato preliminar, distinto de variación mensual desestacionalizada.

Distribución: https://indicadores.cl/api/ . La aplicación conserva tanto fecha del dato como fecha de consulta. Fuente independiente, no API oficial del Banco Central.

## Cálculos independientes

Recalculados en Python desde snapshots reales (sin importar funciones JS):

| Serie | Media 20 | Media 50 | RSI simple 14 |
|---|---:|---:|---:|
| Dólar | 982,5105 | 969,0168 | 51,1418462528144 |
| Cobre | 6,492 | 6,5392 | 42,553191489361666 |

Las pruebas JS contrastan contra estos resultados congelados. RSI usa cociente de sumas de ganancias/pérdidas de 14 cambios, no suavizado Wilder. No se presenta como señal ni pronóstico. No se aplica RSI a series macroeconómicas ni UF. Las tasas se comparan en puntos porcentuales. Los puntos de continuidad TPM no cuentan como observaciones.

## Cambios de interfaz

Panel dialog nativo con título, cierre, Escape, clic exterior, foco inicial y retorno al indicador. Favorito separado del botón de apertura. Gráficos, período, información, lectura fundamental basada en el último dato y análisis técnico dentro del panel. Diseño de columnas en PC y apilado en móvil. El cierre no borra filtros ni posición del tablero.
