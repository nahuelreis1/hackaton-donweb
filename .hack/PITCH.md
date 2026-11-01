# PITCH - Ferretería Inteligente

## Apertura
1. En la ferretería, el cliente pide "el cosito blanco" y el ferretero pierde tiempo adivinando.
2. Nuestra IA traduce el problema del cliente a los productos exactos y le cierra la venta.
3. Miren cómo la pantalla de la derecha reacciona sola mientras el cliente habla.

## Demo
1. Al entrar, una oferta les muestra qué pueden pedir: fotos, audios o texto libre. [G1]
2. Caso plomería desde "Casos para la demo": "me pierde agua el cosito blanco". La IA diagnostica y arma el kit en vivo. [G2]
3. Caso pintura con foto o audio: la IA calcula los metros y la pintura justa. Digo "ya tengo rodillo" y desaparece. [G3]
4. Pregunta libre: "tengo que cortar unas tablas de madera". Arma el kit con la sierra. [G4]
5. "Sí, agregalo": los productos vuelan al carrito y finalizo la compra para retirar sin fila (pago simulado). [G5]

## Resultado y cierre
El cliente termina con su kit exacto, cantidades y total en el carrito, listo para retirar [G5]. El ferretero deja de adivinar y vende mientras atiende a otro.

## Preguntas probables
1. ¿Qué hace exactamente la IA? Recibe texto, foto o audio, entiende el problema y llama herramientas: diagnóstico, armar kit del catálogo, calcular pintura, quitar lo que ya tiene y cargar el carrito. [G2] [G3] [G4]
2. ¿Qué modelo y por qué? se completa al construir
3. ¿Y si se equivoca? Solo puede elegir productos del catálogo; los IDs se validan en el servidor y las cantidades las calcula el código. Si la API falla, hay un modo de respaldo etiquetado.
4. ¿Qué es real y qué es simulado? Diagnóstico, kit, cálculo y carrito son reales; el pago es simulado.
5. ¿Qué sigue? Conectarlo al WhatsApp de la ferretería con el catálogo real.

## Plan B
1. App en vivo en https://dwday-124730116.online.
2. Grabación o capturas del flujo tomadas de la URL pública después del freeze.
3. Narrar la demo desde este guion.
