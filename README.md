# Ferretería Inteligente · Mostrador con IA

Un vendedor con IA para ferreterías: el cliente cuenta su problema como le sale (texto, foto o audio) y la pantalla arma sola el diagnóstico, el kit exacto con cantidades y precios, y el carrito.

**URL pública:** https://www.dwday-124730116.online (mientras el DNS del dominio no propaga: https://138.219.41.121.sslip.io) | **Repositorio:** https://github.com/nahuelreis1/hackaton-donweb

## Problema y usuario
Una ferretería pierde ventas atendiendo por WhatsApp o teléfono: el cliente no sabe el nombre técnico ("el cosito blanco de la pileta") y el ferretero pierde minutos adivinando y presupuestando a mano. Acá el cliente lo dice en sus palabras y se lleva el kit correcto, listo para retirar.

## Pruébalo en 60 segundos
1. Abrí la URL: aparece una oferta con ideas para probar. Cerrala con "Probar ahora" (G1).
2. Abrí "🎬 Casos para la demo" y tocá "▶ Cargar caso" en Plomería: se transcribe el audio del cliente y a la derecha aparecen el diagnóstico y el kit (G2).
3. Cargá el caso de Pintura: calcula 4 × 3 = 12 m², 2,4 L, 1 lata de 4 L. Escribí "ya tengo rodillo" y la tarjeta desaparece (G3).
4. Preguntá algo libre: "tengo que cortar unas tablas de madera" (G4).
5. "Sí, agregalo": los productos vuelan al carrito. "Finalizar compra" muestra el pedido listo para retirar (G5, pago simulado).

## Cómo funciona la IA
- Modelo: `gpt-6.1-terra` con razonamiento `medium`, leídos de `OPENAI_MODEL` y `OPENAI_REASONING_EFFORT`. La llamada ocurre en el servidor (OpenAI Responses API).
- **Tool calling**: el modelo no solo responde texto, decide qué mostrar en pantalla con 5 herramientas: `show_diagnosis`, `calculate_paint`, `show_kit`, `remove_item`, `add_to_cart`.
- Solo puede elegir productos del catálogo (40 ítems): el servidor valida cada id y limita cantidades a 1..20. Los litros y latas de pintura los calcula el código, no el modelo.
- Entradas: texto (máx. 1500 caracteres), foto (se envía al modelo como imagen) y audio (transcripción con `gpt-4o-transcribe`).
- Si la API falla, un respaldo por palabras clave arma el kit con la etiqueta visible "fallback: IA no disponible". Límite: 20 consultas por minuto por IP.

## Real / Simulado / Pendiente
| Elemento | Estado | Evidencia |
|---|---|---|
| G2 diagnóstico + kit | Real | API pública: caso 1 → `show_kit` con sifón, teflón, pinza |
| G3 cálculo + quitar ítem | Real | API pública: `area_m2=12`, `liters=2.4`, `latex4 x1`; "ya tengo rodillo" → `remove_item` |
| G4 consulta libre | Real | API pública: "cortar tablas" → `serrucho` |
| G5 carrito | Real | API pública: "sí, agregalo" → `add_to_cart` |
| Pago | Simulado | Etiquetado en la pantalla de éxito |
| Fotos de productos y de los casos | Pendiente | Se muestran íconos |

## Stack y ejecución local
Node 24 + Express + frontend estático (HTML/CSS/JS) + `openai`. Docker Compose + Caddy en el servidor.
```bash
cp .env.example .env   # completar OPENAI_API_KEY (OPENAI_MODEL, OPENAI_REASONING_EFFORT, OPENAI_TRANSCRIBE_MODEL opcionales)
npm install && node --env-file=.env server.js
```
Los audios de los casos se generaron con ElevenLabs (`scripts/gen-audio.mjs`, requiere `ELEVENLABS_API_KEY`).

## Despliegue
DonWeb Cloud Server con Docker Compose y Caddy (HTTPS automático).

## Limitaciones
- Pago simulado; no hay stock real ni cuentas.
- Catálogo fijo de 40 productos de ferretería.
- La respuesta tarda entre 7 y 10 s (razonamiento `medium`).

## Proceso
Construido con Claude Code y un kit de proceso preparado antes del evento (solo configuración de herramientas, sin código de producto).
