import express from 'express';
import { existsSync } from 'node:fs';
import OpenAI, { toFile } from 'openai';
import { CATALOG } from './src/catalog.js';
import { runAgent, fallbackAgent, modelInfo } from './src/agent.js';

const app = express();
const PORT = process.env.PORT || 3000;
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45_000 }) : null;

app.set('trust proxy', true);
app.use(express.json({ limit: '8mb' }));

// Simple per-IP throttle: 20 AI requests per minute.
const hits = new Map();
function throttle(req, res, next) {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= 20) {
    const wait = Math.ceil((60_000 - (now - list[0])) / 1000);
    return res.status(429).json({ error: `Muchas consultas seguidas. Probá de nuevo en ${wait} s.` });
  }
  list.push(now);
  hits.set(req.ip, list);
  next();
}

app.get('/health', (_req, res) => res.json({ ok: true, ai: modelInfo() }));
// Product photos are optional: expose the path only when the file exists.
const withImages = CATALOG.map((p) => {
  const file = ['jpg', 'png', 'webp'].map((e) => `public/img/products/${p.id}.${e}`).find((f) => existsSync(f));
  return file ? { ...p, img: file.replace('public', '') } : p;
});
app.get('/api/catalog', (_req, res) => res.json(withImages));

app.post('/api/chat', throttle, async (req, res) => {
  const { messages, kit = [], cart = [] } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'Escribí tu consulta.' });
  const msgs = messages.slice(-14).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 1500),
    image: typeof m.image === 'string' && m.image.startsWith('data:image/') && m.image.length < 7_000_000 ? m.image : undefined,
  }));
  const last = msgs[msgs.length - 1];
  if (!last.content.trim() && !last.image) return res.status(400).json({ error: 'Escribí tu consulta.' });
  const cartIds = Array.isArray(cart) ? cart.map(String).slice(0, 60) : [];
  const kitIn = Array.isArray(kit) ? kit.slice(0, 30) : [];
  try {
    res.json(await runAgent({ messages: msgs, kit: kitIn, cart: cartIds }));
  } catch (err) {
    console.error('agent error:', err.code || err.status || err.message);
    res.json({ ...fallbackAgent({ messages: msgs, kit: kitIn }), error_kind: err.code || err.status || 'error' });
  }
});

app.post('/api/transcribe', throttle, express.raw({ type: () => true, limit: '6mb' }), async (req, res) => {
  if (!openai) return res.status(503).json({ error: 'Transcripción no disponible.' });
  if (!req.body?.length) return res.status(400).json({ error: 'Audio vacío.' });
  try {
    const type = req.get('content-type') || 'audio/webm';
    const ext = type.includes('mpeg') || type.includes('mp3') ? 'mp3' : type.includes('wav') ? 'wav' : type.includes('mp4') || type.includes('m4a') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
    const file = await toFile(req.body, `audio.${ext}`, { type });
    const r = await openai.audio.transcriptions.create({ file, model: TRANSCRIBE_MODEL, language: 'es' });
    res.json({ text: r.text });
  } catch (err) {
    console.error('transcribe error:', err.status || err.message);
    res.status(502).json({ error: 'No pude entender el audio. Probá de nuevo o escribilo.' });
  }
});

app.use(express.static('public', { extensions: ['html'] }));

app.listen(PORT, '0.0.0.0', () => console.log(`listening on ${PORT}`));
