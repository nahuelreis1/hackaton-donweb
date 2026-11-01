// Generates demo case photos and product photos with OpenAI gpt-image (run once, output committed).
import OpenAI from 'openai';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { CATALOG } from '../src/catalog.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 180_000, maxRetries: 2 });
const MODEL = process.env.IMAGE_MODEL || 'gpt-image-2';
mkdirSync('public/img/products', { recursive: true });
mkdirSync('public/demo', { recursive: true });

const phone = 'Amateur smartphone photo taken by a homeowner, realistic, natural indoor light, slightly imperfect framing, no text, no watermark. ';
const jobs = [
  ['public/demo/caso1.jpg', phone + 'Under a kitchen sink cabinet: an old white plastic bent drain trap pipe with loose connections leaking water, visible water drops, a small plastic bowl underneath collecting the water.'],
  ['public/demo/caso2.jpg', phone + 'An interior bedroom wall painted white with peeling, flaking paint and a large dark damp humidity stain in the lower part near the floor.'],
  ['public/demo/caso3.jpg', phone + 'A black metal TV wall mount bracket leaning against an apartment wall where the plaster is broken, exposing a red hollow ceramic brick with its internal holes visible.'],
  ['public/demo/caso4.jpg', phone + 'Close-up of a white wall power socket outlet in a home with one side melted and burnt black from overheating, scorch marks around it, a space heater plug lying nearby.'],
  ['public/demo/caso5.jpg', phone + 'A wooden kitchen cabinet door hanging loose and crooked, the hinge screws ripped out of the particle board leaving enlarged broken holes with chipped wood particles.'],
  ...CATALOG.map((p) => [`public/img/products/${p.id}.webp`,
    `Professional e-commerce studio product photo of: ${p.name} (hardware store item${p.type === 'tool' ? ', hand tool' : ''}). Single product, centered, three-quarter angle, realistic 3D look, soft studio lighting, gentle shadow under the product, clean seamless very light warm gray background, high detail, premium catalog style, no text, no labels with readable words, no watermark.`]),
];

async function gen([file, prompt]) {
  if (existsSync(file)) return console.log('skip', file);
  const isProduct = file.endsWith('.webp');
  const r = await client.images.generate({
    model: MODEL, prompt, n: 1,
    size: isProduct ? '1024x1024' : '1536x1024',
    quality: isProduct ? 'low' : 'medium',
    output_format: isProduct ? 'webp' : 'jpeg',
    output_compression: 80,
  });
  writeFileSync(file, Buffer.from(r.data[0].b64_json, 'base64'));
  console.log('ok', file);
}

const queue = [...jobs];
let failed = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await gen(job); } catch (e) { failed++; console.log('FAIL', job[0], e.status || '', String(e.message).slice(0, 160)); }
  }
}));
console.log('done, failed:', failed);
