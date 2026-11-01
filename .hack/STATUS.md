# STATUS

## Phase
BUILD

## Gate log
- 16:32 deploy (16:00) MISSED: late start (router first run 16:32). Priority applied: deploy a thin slice first, features after.
- 17:01 deploy reached late: https://138.219.41.121.sslip.io live, /health 200, real AI call 200 in 7.4 s, trusted cert, no frame headers. Own domain blocked by DNS (ns1/ns2.donweb.com answer REFUSED for the zone); Caddy already lists dwday-124730116.online and www, cert issues automatically once DNS resolves.

## Implemented
- G2 (API, public URL): case-1 text -> show_diagnosis + show_kit with sifon, teflon, pinza (7.6 s).
- G3 (API, public URL): 4x3 wall -> calculate_paint area_m2=12, liters=2.4, latex4 x1; "ya tengo rodillo" -> remove_item rodillo. Transcription of caso2.mp3 200 in 1.2 s.
- G4 (API, public URL): "cortar unas tablas de madera" -> show_kit with serrucho.
- G5 (API, public URL): "sí, agregalo" -> add_to_cart with the kit.
- Case voice notes (ElevenLabs, 5 mp3) served at /demo/casoN.mp3 (200).

## Simulated
- Checkout payment (labeled in UI)

## Pending
- G1/G5 browser checks (pop-up, dropdown, fly-to-cart, checkout modal): not yet observed in a browser.
- Case problem photos (/demo/casoN.jpg) and product photos: Gemini key returns 401 (service account disabled). Cards use icons.
- Own domain dwday-124730116.online: DNS zone not served by DonWeb nameservers.
- Deck /pitch/, README.

## Scope changes
- 16:48 user: entry offer pop-up, "Casos para la demo" dropdown with file URLs, general catalog (~40 products) for free jury use, G4 free question added, cart + checkout merged into G5.
- 16:32 late start: 77 min lost vs 15:15. Recommend cutting the lowest-value contract steps.

## Assumptions
- [ASSUMPTION] DEADLINE 18:30 (default; no official change stated).
- [ASSUMPTION] SSH host/port/password given in chat = authorization to deploy to 138.219.41.121:5466 as root. Event key installed (~/.ssh/dw_event); recommend rotating the root password.
- [ASSUMPTION] USER.md says 20 products but lists 22; contract uses the 22 listed (catalog has 40 with free-use items).
- 16:52 APPROVED (user: "avanza"), deck coral. Model gpt-6.1-terra verified in /v1/models (no 'fast' variant listed). Gemini/ElevenLabs keys taken from ../video-editor/.env.
- 16:53 PLAN written (7 tasks + Td). Deviation: Td after T5 due to late start.
