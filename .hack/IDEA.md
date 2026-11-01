# IDEA - Ferretería Inteligente ("el vendedor estrella del mostrador")

Scope: the user may change it any time; the agent notes it in one line of STATUS.md and continues.

## Brief digest
- Explicit requirements: (1) "Aplicación web funcional - Que ataque la problemática planteada." (2) "IA integrada en el producto - Vía API de un modelo: asistente, clasificador, generador. Usarla solo para programar no cuenta." (3) "Deploy con URL pública [EXCLUYENTE] - En el Cloud Server que te damos, funcionando al cierre."
- Problem: "Un negocio local pierde ventas porque atiende consultas y pedidos a mano, por WhatsApp o por teléfono." / "Mensajes que se pierden, pedidos mal anotados, clientes que esperan y se van."
- Hard constraints: deploy on the given Cloud Server (138.219.41.121), public URL (dwday-124730116.online), working at close (18:30).
- Deliverables: public URL + repository (https://github.com/nahuelreis1/hackaton-donweb.git).
- Implied needs: AI call server-side, labeled fallback while the OpenAI key is not yet provided.
- Language of the brief: Spanish; PITCH.md and UI copy in Spanish.

## Candidates
| Idea | User | AI role | Score | Build min | Risk |
|---|---|---|---|---|---|
| A: Ferretería split-screen sales assistant (USER.md) | Home customer who doesn't know technical names; the ferretero | Multimodal (text/photo/voice) -> tool calls that diagnose, build a kit, compute quantities, fill the cart | 86 | ~110 | medium: OpenAI key arrives late -> labeled keyword fallback |
| B: Peluquería booking bot that fills a calendar via tool calls | Salon owner | Parse chaotic requests into slot bookings | 70 | ~90 | low |
| C: Restaurant WhatsApp order parser into a kitchen ticket | Restaurant owner | Extract order lines from messy text | 72 | ~80 | low |

## Decision
- Chosen: A - the user's idea; it passes all gates and maximizes the live visual "wow" via tool calling.
- Named user: a home customer with a broken household item who does not know what to ask for (and the ferretero who loses 15 min per customer).
- Problem in one sentence: customers describe problems in their own words ("el cosito blanco"), so the store wastes time translating, quoting by hand and loses sales.
- AI transform in one sentence: chaotic text / photo / voice note -> model calls tools (diagnose, build kit from catalog, compute quantities, remove owned tools, add to cart) -> the right panel mutates live with the diagnosis, product cards and a filled cart.
- Today: WhatsApp/phone back-and-forth, guessing products, handwritten quotes, customers waiting and leaving.
- With the app: the customer gets the exact kit, quantities and total in seconds and pays for pickup without queueing.
- Why they would enter the data: they already describe the problem anyway (message/photo/audio); entry cost is one message.
- Narrowest slice: entry offer pop-up, split screen (chat with suggestion chips + "Casos para la demo" dropdown with photo/audio URLs | diagnosis + kit + cart), 5 scripted cases plus a general catalog of about 40 intuitive hardware products for free questions, simulated checkout.
- Deck template: coral - warm commerce/consumer tone matching the orange retail accent of the app.

## User idea check
- Respected. Note: "terra 6.1 fast" is not a model name the agent can verify [U]; the model id is read from `OPENAI_MODEL` and is set when the key arrives.

## Rejected candidates
- B: lower problem fit for the user's chosen domain; user idea wins.
- C: same; less visual impact.

## Not doing
- Real payments, accounts, stock management, WhatsApp integration, admin panel, more than 5 scripted cases.

## Assumptions
- [ASSUMPTION] Stack: Node + Express serving a vanilla JS single page | basis: speed, late start | impact if wrong: none for the jury.
- [ASSUMPTION] Model via OpenAI Responses API with function calling; model id from `OPENAI_MODEL`, reasoning effort from `OPENAI_REASONING_EFFORT` (default `medium`) | basis: USER.md | impact if wrong: change env vars only.
- [ASSUMPTION] Quantities (paint liters, cans) are computed by code in a tool (`calculate_paint`), the model only extracts dimensions | basis: rubric "code computes numbers" | impact if wrong: none.
- [ASSUMPTION] Paint rule: liters = area_m2 x 2 coats / 10 m2 per liter; <=1 L -> 1L can, <=4 L -> 4L can, else ceil(L/4) x 4L | basis: common latex coverage [I] | impact if wrong: adjust constants.
- [ASSUMPTION] Voice: ElevenLabs Speech-to-Text if `ELEVENLABS_API_KEY` is set, else OpenAI transcription | basis: USER.md | impact if wrong: swap provider.
- [ASSUMPTION] Until the OpenAI key exists, chat runs a keyword fallback clearly labeled "fallback: IA no disponible" | basis: key arrives later | impact if wrong: none.
- [ASSUMPTION] No .env in the repo at 16:32: product/problem images (Gemini) and case audios (ElevenLabs TTS) are generated once the user adds keys; placeholders until then | basis: file not found | impact if wrong: assets missing in the demo.
- [ASSUMPTION] Checkout is simulated and labeled as such.

## Critic
- Round 1: skipped: late start (16:34, deadline 18:30), time goes to deploy.
- Change applied: none
- Round 2: not needed

## Sources
- none, no research needed.
