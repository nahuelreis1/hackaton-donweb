import OpenAI from 'openai';
import { BY_ID, calculatePaint, catalogForPrompt } from './catalog.js';

const MODEL = process.env.OPENAI_MODEL || 'gpt-6.1-terra';
const EFFORT = process.env.OPENAI_REASONING_EFFORT || 'medium';
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 1 }) : null;

export const modelInfo = () => ({ model: MODEL, effort: EFFORT, configured: Boolean(client) });

const INSTRUCTIONS = `Sos "Tito", el vendedor estrella del mostrador de Ferretería El Clavo (Argentina).
El cliente no sabe nombres técnicos: habla en lenguaje cotidiano ("el cosito blanco"), manda fotos o audios transcriptos.
Tu trabajo: traducir su problema a los productos EXACTOS del catálogo y cerrarle la venta. La pantalla del cliente se actualiza SOLO a través de tus herramientas, así que usalas siempre.

Flujo obligatorio cuando el cliente cuenta un problema o un proyecto:
1. Llamá show_diagnosis (qué detectaste en idioma ferretero y cuál es la solución).
2. Si hay que pintar paredes y hay medidas (o podés estimarlas de una foto), llamá calculate_paint ANTES del kit y usá las latas que devuelve.
3. Llamá show_kit con el kit COMPLETO de 4 a 6 productos: el producto principal + los insumos de sellado/fijación/terminación que van con él + la herramienta para instalarlo. Solo ids del catálogo, cantidad y un motivo de máximo 8 palabras. Ej: sifón flojo -> sifon, teflon, silicona, pinza.
4. Respondé en 1 o 2 oraciones y terminá preguntando si le agregás el kit al carrito.

Otras reglas:
- Si el cliente dice que ya tiene algo (ej. "ya tengo rodillo"), llamá remove_item con esos ids.
- Si cambia medidas o necesidades, recalculá y volvé a llamar show_kit con el kit completo actualizado (sin lo que ya tiene).
- Si confirma ("sí", "dale", "agregalo", "de una"), llamá add_to_cart y contestá con un cierre corto y amable.
- Si pide algo que no está en el catálogo, decilo y ofrecé lo más parecido que sí haya.
- Si falta un dato clave, armá igual el kit con un supuesto razonable y aclaralo.
- Nunca inventes productos ni precios. No escribas precios ni listas largas en el texto: la pantalla ya los muestra.
- Español rioplatense, cálido, breve (máximo 2 oraciones antes de la pregunta de cierre).

CATÁLOGO (id | nombre | tipo | precio ARS | rubro):
${catalogForPrompt()}`;

const TOOLS = [
  {
    type: 'function', name: 'show_diagnosis',
    description: 'Muestra en pantalla qué entendiste del problema del cliente y la solución técnica.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['detected', 'solution', 'category'],
      properties: {
        detected: { type: 'string', description: 'Problema en idioma ferretero, ej: "Fuga en sifón de desagüe de cocina"' },
        solution: { type: 'string', description: 'Solución técnica breve, ej: "Reemplazo de sifón y sellado de rosca"' },
        category: { type: 'string', enum: ['plomeria', 'pintura', 'fijaciones', 'electricidad', 'herrajes', 'carpinteria', 'otro'] },
      },
    },
  },
  {
    type: 'function', name: 'calculate_paint',
    description: 'Calcula superficie, litros y latas de látex para una pared. El cálculo lo hace el sistema.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['width_m', 'height_m', 'coats'],
      properties: {
        width_m: { type: 'number' }, height_m: { type: 'number' },
        coats: { type: 'integer', description: 'Manos de pintura, normalmente 2' },
      },
    },
  },
  {
    type: 'function', name: 'show_kit',
    description: 'Reemplaza el kit recomendado en pantalla por esta lista completa.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false, required: ['id', 'qty', 'reason'],
            properties: { id: { type: 'string' }, qty: { type: 'integer' }, reason: { type: 'string' } },
          },
        },
      },
    },
  },
  {
    type: 'function', name: 'remove_item',
    description: 'Quita del kit productos que el cliente ya tiene o no quiere.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['ids', 'reason'],
      properties: { ids: { type: 'array', items: { type: 'string' } }, reason: { type: 'string' } },
    },
  },
  {
    type: 'function', name: 'add_to_cart',
    description: 'Agrega el kit actual completo al carrito cuando el cliente confirma.',
    parameters: { type: 'object', additionalProperties: false, properties: {}, required: [] },
  },
];

const clampQty = (q) => Math.min(Math.max(parseInt(q, 10) || 1, 1), 20);
const enrich = (it) => ({ ...BY_ID[it.id], qty: clampQty(it.qty), reason: String(it.reason || '').slice(0, 80) });

// Executes one tool call against the request-local state; returns [output for the model, action for the UI].
function runTool(name, args, state) {
  switch (name) {
    case 'show_diagnosis': {
      const a = { type: 'show_diagnosis', detected: String(args.detected || '').slice(0, 140), solution: String(args.solution || '').slice(0, 140), category: args.category || 'otro' };
      return [{ ok: true }, a];
    }
    case 'calculate_paint': {
      const r = calculatePaint(args.width_m, args.height_m, args.coats);
      return [r, r.error ? null : { type: 'calculate_paint', ...r }];
    }
    case 'show_kit': {
      const seen = new Set();
      const items = (Array.isArray(args.items) ? args.items : [])
        .filter((it) => BY_ID[it?.id] && !seen.has(it.id) && seen.add(it.id))
        .map(enrich);
      const dropped = (args.items || []).filter((it) => !BY_ID[it?.id]).map((it) => it?.id);
      if (!items.length) return [{ ok: false, error: 'ningún id válido', dropped }, null];
      state.kit = items;
      return [{ ok: true, shown: items.map((i) => i.id), dropped }, { type: 'show_kit', items }];
    }
    case 'remove_item': {
      const ids = (args.ids || []).filter((id) => state.kit.some((k) => k.id === id));
      state.kit = state.kit.filter((k) => !ids.includes(k.id));
      return [{ ok: true, removed: ids, remaining: state.kit.map((k) => k.id) }, ids.length ? { type: 'remove_item', ids, reason: String(args.reason || '') } : null];
    }
    case 'add_to_cart': {
      if (!state.kit.length) return [{ ok: false, error: 'el kit está vacío' }, null];
      return [{ ok: true, added: state.kit.map((k) => k.id) }, { type: 'add_to_cart', items: state.kit }];
    }
    default:
      return [{ ok: false, error: 'herramienta desconocida' }, null];
  }
}

function buildInput(messages, kit, cartIds) {
  const input = [];
  const last = messages.length - 1;
  messages.forEach((m, i) => {
    if (m.role === 'assistant') { input.push({ role: 'assistant', content: m.content || '...' }); return; }
    const content = [{ type: 'input_text', text: m.content || (m.image ? 'Te mando una foto del problema.' : '...') }];
    if (m.image && i === last) content.push({ type: 'input_image', image_url: m.image, detail: 'low' });
    else if (m.image) content[0].text += ' [foto enviada antes]';
    input.push({ role: 'user', content });
  });
  const kitTxt = kit.length ? kit.map((k) => `${k.id} x${k.qty}`).join(', ') : 'vacío';
  input.push({ role: 'developer', content: `Estado de la pantalla. Kit actual: ${kitTxt}. Carrito: ${cartIds.length ? cartIds.join(', ') : 'vacío'}.` });
  return input;
}

export async function runAgent({ messages, kit = [], cart = [] }) {
  if (!client) throw Object.assign(new Error('no api key'), { code: 'no_key' });
  const state = { kit: kit.filter((k) => BY_ID[k.id]).map(enrich) };
  const actions = [];
  const started = Date.now();
  let response = await client.responses.create({
    model: MODEL, instructions: INSTRUCTIONS, input: buildInput(messages, state.kit, cart),
    tools: TOOLS, reasoning: { effort: EFFORT }, max_output_tokens: 4000,
  });
  for (let round = 0; round < 5; round++) {
    const calls = response.output.filter((o) => o.type === 'function_call');
    if (!calls.length) break;
    const outputs = calls.map((c) => {
      let args = {};
      try { args = JSON.parse(c.arguments || '{}'); } catch { /* invalid args -> empty */ }
      const [out, action] = runTool(c.name, args, state);
      if (action) actions.push(action);
      return { type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(out) };
    });
    response = await client.responses.create({
      model: MODEL, instructions: INSTRUCTIONS, previous_response_id: response.id, input: outputs,
      tools: TOOLS, reasoning: { effort: EFFORT }, max_output_tokens: 4000,
    });
  }
  return { reply: response.output_text || '¿Te agrego el kit al carrito?', actions, kit: state.kit, model: MODEL, ms: Date.now() - started, fallback: false };
}

// Labeled keyword fallback, used only when the API is unavailable.
const FALLBACK_RULES = [
  { re: /pileta|bacha|sif[oó]n|gotea|pierde agua|ca[ñn]o/i, d: ['Pérdida en desagüe de cocina', 'Reemplazo de sifón y sellado de rosca', 'plomeria'], kit: [['sifon', 1, 'Reemplaza el sifón flojo'], ['teflon', 1, 'Sella las roscas'], ['silicona', 1, 'Sella uniones'], ['pinza', 1, 'Para ajustar las tuercas']] },
  { re: /pint|pared|humedad|descascar/i, d: ['Pared con humedad y pintura descascarada', 'Reparar, sellar y pintar con antihongos', 'pintura'], kit: [['latex4', 1, 'Cubre 12 m² a dos manos'], ['enduido', 1, 'Rellena lo descascarado'], ['fijador', 1, 'Sella antes de pintar'], ['rodillo', 1, 'Para aplicar el látex'], ['espatula', 1, 'Para enduir y lijar']] },
  { re: /tele|tv|soporte|ladrillo hueco|colgar/i, d: ['Fijación pesada en ladrillo hueco', 'Tarugos de expansión con tope + tirafondos', 'fijaciones'], kit: [['tarugos', 1, 'Agarran en ladrillo hueco'], ['tirafondos', 1, 'Soportan peso del TV'], ['mecha10', 1, 'Para el diámetro del tarugo'], ['nivel', 1, 'Para que quede derecho']] },
  { re: /enchufe|tomacorriente|derriti|quem|caloventor|estufa/i, d: ['Tomacorriente derretido por sobrecarga', 'Reemplazo por toma reforzado de 20 A', 'electricidad'], kit: [['toma20', 1, 'Soporta alto consumo'], ['aisladora', 1, 'Aísla empalmes'], ['cable25', 1, 'Sección para 20 A'], ['destaislado', 1, 'Trabajo seguro con buscapolo']] },
  { re: /bisagra|alacena|puerta|mueble|agujero/i, d: ['Bisagra arrancada en aglomerado', 'Reparar agujeros y colocar bisagras nuevas', 'herrajes'], kit: [['bisagras', 1, 'Reemplazan las rotas'], ['placa', 2, 'Cubre el agujero agrandado'], ['masilla', 1, 'Rellena la madera'], ['phillips', 1, 'Imantado, no se cae el tornillo']] },
  { re: /cortar|madera|tabla|serru|sierra/i, d: ['Corte de madera', 'Serrucho o caladora según el corte', 'carpinteria'], kit: [['serrucho', 1, 'Cortes rectos a mano'], ['metro', 1, 'Para medir el corte'], ['lija_madera', 1, 'Prolija los bordes'], ['guantes', 1, 'Protección de manos']] },
];

export function fallbackAgent({ messages, kit = [] }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const text = lastUser?.content || '';
  const label = 'fallback: IA no disponible';
  if (/^(s[ií]|dale|agreg|de una|ok)/i.test(text.trim()) && kit.length) {
    const items = kit.filter((k) => BY_ID[k.id]).map(enrich);
    return { reply: `Listo, agregado al carrito. (${label})`, actions: [{ type: 'add_to_cart', items }], kit: items, fallback: true };
  }
  const rule = FALLBACK_RULES.find((r) => r.re.test(text));
  if (!rule) return { reply: `Contame un poco más qué tenés que arreglar. (${label})`, actions: [], kit, fallback: true };
  const items = rule.kit.map(([id, qty, reason]) => enrich({ id, qty, reason }));
  return {
    reply: `Te armé el kit para eso. ¿Te lo agrego al carrito? (${label})`,
    actions: [{ type: 'show_diagnosis', detected: rule.d[0], solution: rule.d[1], category: rule.d[2] }, { type: 'show_kit', items }],
    kit: items, fallback: true,
  };
}
