# PLAN - Ferretería Inteligente

Stack: Node 24 + Express + static vanilla JS/CSS frontend (no build) + `openai` npm (Responses API, function calling) + Docker Compose with Caddy (auto HTTPS). No DB.
Host: https://dwday-124730116.online (own domain, A record -> 138.219.41.121). HTTPS required anyway (mic recording = secure context).
Model: `OPENAI_MODEL=gpt-6.1-terra`, `OPENAI_REASONING_EFFORT=medium` (drop to low if latency > 15 s). Transcription: `gpt-4o-transcribe`. Assets: Gemini images, ElevenLabs TTS (offline scripts, committed to `public/`).

| ID | Task | Serves | Verify |
|---|---|---|---|
| T0 | Walking skeleton: server.js with `/health`, `/api/chat` (real tool-calling call), catalog, minimal page; Dockerfile + compose + Caddy; deploy to the domain; push repo | G1, G2 | `curl -s https://dwday-124730116.online/health` -> `{"ok":true}`; case-1 curl from contract G2 -> `show_kit` contains `sifon` |
| T1 | Full UI: entry offer pop-up, split screen, chat with chips + attach + mic, "Casos para la demo" dropdown with file URLs, diagnosis header, animated kit cards (materials/tools), action chips | G1, G2 | Browser: pop-up on load; case 1 renders 4 cards in < 20 s |
| T2 | Multimodal + paint calc + remove: `/api/transcribe`, image input, `calculate_paint` tool, `remove_item` | G3 | Contract G3 curl: `area_m2 = 12`, `liters = 2.4`, `latex4` qty 1 |
| T3 | Free catalog (~40) + cart: `add_to_cart`, fly animation, cart drawer, total, simulated checkout modal | G4, G5 | G4 curl -> `serrucho` or `caladora`; browser total `$31.100` after case 1 |
| T4 | Assets: Gemini product + case images, ElevenLabs case audios into `public/` (category icon fallback) | G1, G2 | `curl -o /dev/null -w "%{http_code}" https://dwday-124730116.online/demo/caso1.jpg` -> `200` |
| -- | FREEZE 17:15 (late start: in practice freeze when T3 is live) | | |
| T5 | AI hardening: timeout, 429 backoff, labeled keyword fallback, id validation, throttle 20/min/IP, input caps | all | Unset key locally -> "fallback: IA no disponible" visible |
| Td | Deck at `/pitch/` with `hack-deck` (coral) | presentation | `curl -s -o /dev/null -w "%{http_code}" https://dwday-124730116.online/pitch/` -> `200` |
| T6 | README + rehearsal (cold-open on public URL), tag v1.0 | all | README pushed; contract checks G1-G5 pass |

Kill criterion (from contract): cut in-browser audio recording (keep upload), product images (category icons), extra catalog beyond 10 items. If the AI step fails by freeze, ship with the labeled fallback.

Deviation: Td moved after T5 because of the late start (16:32); deploy and the golden path come first.
