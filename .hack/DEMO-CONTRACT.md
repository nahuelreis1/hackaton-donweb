# DEMO-CONTRACT - Ferretería Inteligente

Status: source of truth. The user may change it any time; the agent notes it in one line of STATUS.md.

## Global constraints
- Runs on the DonWeb Cloud Server 138.219.41.121, public URL https://dwday-124730116.online (A record already points to the server).
- Public GitHub repository https://github.com/nahuelreis1/hackaton-donweb. First commit after the start of the event.
- The shared OpenAI key stays server-side only: server environment variable, never in browser code, repo, logs or screenshots.
- Deadline: 18:30. Submission = public URL + repository.
- Brief hard constraints: "Deploy con URL pública [EXCLUYENTE] - En el Cloud Server que te damos, funcionando al cierre."; "IA integrada en el producto - Vía API de un modelo".
- User requirement (16:48): "la demo debe ser explicita, simple y visual y potente"; the jury uses the app about 5 minutes.

## Product defaults
- Entry pop-up styled like an e-commerce offer explains what to try (see G1). Closing it leaves the split screen.
- One obvious primary action: the "Casos para la demo" dropdown (one click loads and sends a case) plus suggestion chips in the chat.
- A one-click example that makes a REAL AI call.
- Free own-input path (text, photo upload, audio upload/record) over a general hardware catalog, with throttling.
- A labeled fallback only when the API fails or no key is configured.
- Cold-open test: a person who has never seen the app completes the flow in under 2 minutes.
- Deviation: no separate "jury tray" panel -> a compact dropdown | reason: user request 16:48, keeps the chat simple.

## Catalog (fixture, prices in ARS)
General hardware catalog so free questions work, not only the 5 cases. The model can only pick ids from this list.

Case products (22):
| id | name | type | price |
|---|---|---|---:|
| sifon | Sifón extensible universal PVC blanco | material | 8900 |
| teflon | Cinta de teflón alta densidad | material | 1500 |
| silicona | Sellador de silicona antihongos | material | 6200 |
| pinza | Pinza pico de loro ajustable | tool | 14500 |
| latex4 | Látex interior antihongos blanco 4 L | material | 32000 |
| latex1 | Látex interior antihongos blanco 1 L | material | 9800 |
| enduido | Enduido plástico interior 1 kg | material | 5400 |
| fijador | Fijador sellador al agua 1 L | material | 7600 |
| rodillo | Rodillo de lana sintética | tool | 8500 |
| espatula | Espátula metálica flexible + lija | tool | 4900 |
| tarugos | Tarugos de expansión para ladrillo hueco (pack) | material | 4200 |
| tirafondos | Tornillos tirafondos hexagonales con arandela (pack) | material | 3800 |
| mecha10 | Mecha de widia 10 mm | tool | 3600 |
| nivel | Nivel de mano con burbuja | tool | 7200 |
| toma20 | Tomacorriente reforzado 20 A (tapa + bastidor + módulo) | material | 9500 |
| aisladora | Cinta aisladora ignífuga negra | material | 1200 |
| cable25 | Cable eléctrico normalizado 2,5 mm (rollo) | material | 18900 |
| destaislado | Destornillador aislado + buscapolo | tool | 6800 |
| bisagras | Par de bisagras cazoleta de acero | material | 5600 |
| placa | Placa reparadora inoxidable con tornillos | material | 2900 |
| masilla | Masilla plástica reparadora para madera | material | 3400 |
| phillips | Destornillador Phillips imantado | tool | 4100 |

Free-experience products (about 18, final list fixed in code): serrucho, sierra caladora, hojas para caladora, martillo, taladro percutor, set de mechas para madera, tornillos para madera, clavos, cola vinílica, lija para madera, barniz, pincel, cinta de enmascarar, esmalte sintético, cinta métrica, guantes, anteojos de seguridad, lámpara LED.

## Golden path
| ID | User action / input | System and AI behavior | Observable result | Runnable check (exact expectation) |
|---|---|---|---|---|
| G1 | Opens the public URL | Serves the split-screen page with the entry pop-up | Pop-up "oferta" with 3-4 ideas to try ("Mandá una foto de tu pieza y pedí pintura", "¿Tenés que cortar madera?", "Se te rompió un enchufe"...) and a button "Probar ahora". Behind it: left chat with suggestion chips and the "Casos para la demo" dropdown (5 cases, each with links to its photo and audio files + "Cargar caso"); right: empty counter | `curl -s -o /dev/null -w "%{http_code}" https://dwday-124730116.online/` returns `200`; `curl -s -o /dev/null -w "%{http_code}" https://dwday-124730116.online/demo/caso1.jpg` returns `200`; browser: pop-up visible on load, closes, dropdown lists 5 cases |
| G2 | Picks case 1 in the dropdown (or types "me pierde agua el cosito blanco doblado abajo de la pileta") | Server calls the model with tools; model calls `show_diagnosis` and `show_kit` with catalog ids; server validates ids | Right panel animates: diagnosis header + materials (sifón, teflón, silicona) and tools (pinza) cards with qty and price; assistant asks to add the kit to the cart | `curl -s -X POST https://dwday-124730116.online/api/chat -H "content-type: application/json" -d '{"messages":[{"role":"user","content":"me pierde agua el cosito blanco doblado abajo de la pileta de la cocina"}]}'` returns 200 and `actions[]` contains a `show_kit` whose item ids include `sifon` and `teflon` |
| G3 | Paint by photo/voice: sends the case-2 photo or audio ("pared de 4 por 3 con humedad"), then "ya tengo rodillo" | Audio transcribed server-side / photo read by the model; model calls `calculate_paint` (code: 12 m2 x 2 / 10 = 2.4 L -> 1 x latex4) and `show_kit`; on "ya tengo rodillo" calls `remove_item` | Header shows "12 m²" and 2.4 L; kit shows 1 x Látex 4 L; rodillo card disappears live | `curl ... -d '{"messages":[{"role":"user","content":"pared de 4 por 3 metros con humedad, cuanta pintura?"}]}'` -> `actions[]` has `calculate_paint` result `area_m2 = 12`, `liters = 2.4` and kit item `latex4` qty `1`; browser: "ya tengo rodillo" removes the `rodillo` card within 15 s |
| G4 | Free question outside the 5 cases: "tengo que cortar unas tablas de madera" | Same tool flow over the general catalog | Kit with a saw (serrucho or sierra caladora) and related items | `curl ... -d '{"messages":[{"role":"user","content":"tengo que cortar unas tablas de madera"}]}'` -> `show_kit` item ids include `serrucho` or `caladora` |
| G5 | Replies "sí, agregalo" (or clicks the confirm button), then "Finalizar compra" | Model calls `add_to_cart`; checkout is simulated | Cards fly to the cart, badge and total update; success modal "Pedido pagado - listo para retirar en mostrador" labeled simulated payment | Browser: after case 1 + "sí, agregalo", cart total equals 8900 + 1500 + 6200 + 14500 = `$31.100`; "Finalizar compra" shows the modal and empties the cart |

Brief links: G1 -> "Aplicación web funcional" + "Deploy con URL pública"; G2 -> "IA integrada en el producto" + "clientes que esperan y se van"; G3 -> "IA integrada" (multimodal assistant) + "pedidos mal anotados"; G4 -> "Web con asistente" (free consultation); G5 -> "Catálogo + bot de pedidos" + "pierde ventas" (closes the sale).

User requirements served: "a la izquierda el cliente hablando en lenguaje natural caótico, y a la derecha el sistema visual del negocio reaccionando en vivo" -> G2-G5; "un desplegable con 'casos para la demo' donde ahi esten las url a los archivos" -> G1; "un pop up que aparece que le explica al jurado como si fuera una oferta de ecommerce" -> G1; "construir previo productos así muy intuitivos que tiene una ferretería para que esté la experiencia libre" -> G4; "Si el cliente comenta en el chat que ya tiene alguna herramienta ... el kit se actualiza" -> G3; "animación visual evidente donde los productos viajan hacia el Carrito" -> G5; "Finalizar Compra ... cierre de compra simulado" -> G5.

AI step: G2 shows the AI working. Each tool call appears as a small live "acción" chip (diagnóstico, kit, cálculo, carrito) so the jury sees what the AI decided.

## Real / Simulated / Pending
| Item | Status | Evidence |
|---|---|---|
| G1 | Pending | |
| G2 | Pending | |
| G3 | Pending | |
| G4 | Pending | |
| G5 | Pending | |
| Checkout payment | Simulated | labeled in UI |

## Deploy acceptance
- The public URL responds over HTTPS with a valid certificate (Caddy).
- `GET /health` returns 200.
- No `X-Frame-Options` and no CSP `frame-ancestors` (the deck embeds the app). Check: `curl -sI https://dwday-124730116.online/ | grep -i -E "x-frame-options|frame-ancestors"` prints nothing.
- No session cookies required.
- The repository is pushed and the deployed version matches it.

## AI acceptance
- The model call happens on the server; the key does not appear in the page source or any static asset.
- Model name from `OPENAI_MODEL`; reasoning effort from `OPENAI_REASONING_EFFORT`.
- Tool arguments validated: product ids must exist in the catalog, quantities 1..20; unknown ids are dropped.
- On case 1 text, 3 consecutive runs return a `show_kit` containing `sifon`.

## Failure behavior
| Failure | Behavior | Check |
|---|---|---|
| No key, API error, timeout or 429 | Keyword fallback produces a kit, labeled "fallback: IA no disponible" | Unset key; label visible |
| Invalid tool output | Invalid ids dropped; if no valid action, assistant text only | Validator check |
| Empty or oversized input | Rejected inline (max 1500 chars, image 5 MB, audio 5 MB) | Submit empty input |
| Throttle exceeded | Friendly message with wait time (20 requests/min per IP) | Repeat quickly |
| Question outside the catalog | Assistant says it is not in stock and suggests the closest category | Ask for "una heladera" |

## Kill criterion
Last-built steps that can be cut: in-browser audio recording (keep audio upload), product images (fall back to category icons), G4 extra catalog beyond 10 items. If the AI step does not work by the freeze gate (17:15), ship with the labeled fallback and keep fixing.

## Non-goals
- Real payments, accounts, stock management, WhatsApp integration, admin panel, more than 5 scripted cases.

## Rubric mapping
| Criterion | Weight | Planned evidence (steps) | Expected score (1-5) |
|---|---:|---|---:|
| Problem resolution | 35 | G2, G3, G4, G5 | 4 |
| Depth and completeness | 30 | G3 (calc + live removal), G4 (free use), failure behavior, README | 4 |
| AI quality | 25 | G2, G3, G4 (tool calling, multimodal, validated ids) | 4 |
| Presentation | 10 | G1 pop-up + dropdown, PITCH.md | 5 |
