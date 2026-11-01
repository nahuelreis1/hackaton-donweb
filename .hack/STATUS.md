# STATUS

## Phase
BUILD

## Gate log
- 16:32 deploy (16:00) MISSED: late start (router first run 16:32). Priority applied: deploy a thin slice first, features after.

## Implemented

## Simulated
- Checkout payment (labeled in UI)

## Pending
- G1 G2 G3 G4 G5

## Scope changes
- 16:48 user: entry offer pop-up, "Casos para la demo" dropdown with file URLs, general catalog (~40 products) for free jury use, G4 free question added, cart + checkout merged into G5.
- 16:32 late start: 77 min lost vs 15:15. Recommend cutting the lowest-value contract steps.

## Assumptions
- [ASSUMPTION] DEADLINE 18:30 (default; no official change stated).
- [ASSUMPTION] No .env found in the project root at 16:32; Gemini/ElevenLabs keys must be added by the user. Assets fall back to placeholders if keys are missing.
- [ASSUMPTION] SSH host/port/password given in chat = authorization to deploy to 138.219.41.121:5466 as root. Recommend rotating the password after key setup.
- [ASSUMPTION] USER.md says 20 products but lists 22; contract uses the 22 listed.
- 16:52 APPROVED (user: "avanza"), deck coral. Model gpt-6.1-terra verified in /v1/models (no 'fast' variant listed). Gemini/ElevenLabs keys taken from ../video-editor/.env.
- 16:53 PLAN written (7 tasks + Td). Deviation: Td after T5 due to late start.
