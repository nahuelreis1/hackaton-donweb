# Ferrelisto · Brief para el jurado

**Ferrelisto** es el vendedor con IA de una ferretería. El cliente cuenta su problema como le sale (texto, **foto** o **audio**) y la pantalla arma sola el diagnóstico, el kit exacto con cantidades y precios, y el carrito.

| | |
|---|---|
| **App (URL pública)** | https://www.dwday-124730116.online |
| **Repositorio** | https://github.com/nahuelreis1/hackaton-donweb (versión entregada: tag `v1.0`) |
| **Dispositivo recomendado** | Computadora (pantalla dividida). En el celular funciona en una sola columna. |

## Cómo probarla en 3 minutos

1. Abrí la URL. El pop-up muestra un video de 20 segundos con la app en uso. Tocá **"Probar ahora"**.
2. Abrí **"🎬 Casos para la demo"** (arriba del chat) y tocá **"▶ Cargar caso"** en cualquiera de los 5 casos.
3. Mirá el panel derecho (**Mostrador**): aparece el diagnóstico y el kit de productos, en vivo.
4. Respondé **"Sí, agregalo"**: los productos vuelan al carrito. Después, **"Finalizar compra"**.

## Qué revisar (funcionalidades clave)

| # | Qué probar | Cómo | Qué tiene que pasar |
|---|---|---|---|
| 1 | **Enviar una imagen** | Botón 📷 del chat. Usá una foto de los casos (enchufe quemado, bisagra arrancada) o una propia. Podés mandarla sin texto. | La IA identifica el problema solo con la foto y arma el kit (ej.: foto del enchufe → "tomacorriente quemado" → toma reforzado de 20 A). |
| 2 | **Enviar un audio** | Botón 🎵 para subir un audio, o 🎙️ para grabar con el micrófono (el navegador pide permiso). | El audio se transcribe y aparece en el chat; la IA responde y arma el kit. |
| 3 | **Texto libre y "caótico"** | Escribí como un cliente real: "me pierde agua el cosito blanco abajo de la pileta", "necesito cortar maderaaaa". | Traduce al "idioma ferretero": diagnóstico, solución y productos exactos del catálogo. |
| 4 | **Mostrador en vivo** | Mirá el panel derecho mientras la IA responde. | Diagnóstico ("lo que contaste → detectado → solución"), kit separado en **"Lo que necesitás"** y **"Sugeridos"**, con foto, motivo, cantidad y precio. |
| 5 | **Cálculo automático** | Caso Pintura (audio) o escribí "pared de 4 por 3 con humedad". | Muestra 12 m², 2 manos, 2,4 L → 1 lata de 4 L. El cálculo lo hace el código, no el modelo. |
| 6 | **Editar el kit conversando** | Escribí "ya tengo rodillo" (o tocá "Ya lo tengo" en una tarjeta). | La tarjeta desaparece en vivo y el total se actualiza. |
| 7 | **Carrito** | "Sí, agregalo" en el chat, o el botón "Agregar kit al carrito". | Animación de los productos volando al carrito, contador y total. "Finalizar compra" muestra el pedido listo para retirar (**pago simulado**). |
| 8 | **Pregunta fuera de los casos** | "Quiero colgar un cuadro pesado", "tengo que cortar tablas". | Arma kits con el catálogo general (40 productos), no solo con los 5 casos. |
| 9 | **Algo que no vendemos** | "Necesito una heladera". | Responde que no está en el catálogo y no inventa productos. |

## Recursos para probar la IA multimodal

Se pueden cargar con un clic desde "Casos para la demo", o descargar y subir a mano al chat:

| Caso | Audio del cliente | Foto del problema |
|---|---|---|
| Plomería · pierde agua la bacha | [caso1.mp3](https://www.dwday-124730116.online/demo/caso1.mp3) | [caso1.jpg](https://www.dwday-124730116.online/demo/caso1.jpg) |
| Pintura · pared con humedad (4 × 3 m) | [caso2.mp3](https://www.dwday-124730116.online/demo/caso2.mp3) | — |
| Fijaciones · TV en ladrillo hueco | [caso3.mp3](https://www.dwday-124730116.online/demo/caso3.mp3) | — |
| Electricidad · enchufe derretido | — | [caso4.jpg](https://www.dwday-124730116.online/demo/caso4.jpg) |
| Muebles · puerta de alacena caída | — | [caso5.jpg](https://www.dwday-124730116.online/demo/caso5.jpg) |

## Endpoints

Para usar la app alcanza con **una sola URL**: https://www.dwday-124730116.online (todo pasa en la página principal).

Para una revisión técnica, la página usa esta API interna (la key de OpenAI vive solo en el servidor):

| Método | Ruta | Para qué |
|---|---|---|
| GET | `/health` | Estado del servicio y modelo configurado. |
| GET | `/api/catalog` | Catálogo de 40 productos (precios y fotos). |
| POST | `/api/chat` | Conversación con el agente: devuelve la respuesta y las acciones de pantalla (tool calls). |
| POST | `/api/transcribe` | Transcribe un audio a texto. |

Ejemplo:

```bash
curl -s -X POST https://www.dwday-124730116.online/api/chat \
  -H "content-type: application/json" \
  -d '{"messages":[{"role":"user","content":"me pierde agua el cosito blanco abajo de la pileta"}]}'
```

## Cómo funciona la IA

- **Modelo:** `gpt-6.1-terra` (OpenAI, razonamiento `medium`) vía Responses API, llamado desde el servidor.
- **Tool calling:** el modelo no solo responde texto, maneja la pantalla con 5 herramientas: `show_diagnosis`, `calculate_paint`, `show_kit`, `remove_item` y `add_to_cart`.
- **Multimodal:** las fotos van al modelo como imagen, y los audios se transcriben con `gpt-4o-transcribe`.
- **Controles:** solo puede elegir productos del catálogo (el servidor valida cada id), las cantidades se limitan a 1–20, los litros de pintura los calcula el código, y hay un límite de 20 consultas por minuto por IP. Si la API falla, un respaldo arma el kit con la etiqueta visible "fallback: IA no disponible".

## Real y simulado

- **Real:** diagnóstico, kit, foto, audio, cálculo, edición del kit y carrito, verificados en la URL pública.
- **Simulado:** el pago (la pantalla lo indica).
- **Límites:** catálogo fijo de 40 productos; cada respuesta tarda entre 5 y 10 segundos.
