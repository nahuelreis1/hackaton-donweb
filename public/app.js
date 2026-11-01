const $ = (s) => document.querySelector(s);
const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');

const CASES = [
  { id: 'caso1', icon: '🚰', title: 'Plomería · Pierde agua abajo de la bacha', text: 'Hola, me pierde agua el cosito blanco doblado que está abajo de la pileta de la cocina, está todo flojo, ¿qué le tengo que poner?' },
  { id: 'caso2', icon: '🎨', title: 'Pintura · Pared con humedad', text: 'Quiero arreglar y pintar una pared de mi pieza que mide 4 por 3 metros y se me descascaró abajo por la humedad, ¿qué compro y cuánta pintura necesito?' },
  { id: 'caso3', icon: '📺', title: 'Fijaciones · TV en ladrillo hueco', text: 'Necesito colgar el soporte de una tele grande en el departamento, pero la pared es de ladrillo hueco y los tornillos comunes me bailan y se salen.' },
  { id: 'caso4', icon: '🔌', title: 'Electricidad · Enchufe derretido', text: 'Enchufé el caloventor y se me derritió el plástico del enchufe de la pared, ¿qué tengo que comprar para cambiarlo y que no se vuelva a quemar?' },
  { id: 'caso5', icon: '🚪', title: 'Muebles · Puerta de alacena caída', text: 'Se me salió la bisagra de la puerta de la alacena de la cocina y quedaron los agujeros todos agrandados en la madera, ya no agarra ningún tornillo.' },
];

const OFFERS = [
  { em: '📷', title: 'Mandá una foto de tu pieza y pedí pintura', sub: 'Te calcula metros, litros y latas.', prompt: 'Quiero pintar las paredes de mi pieza, una pared mide 3,5 por 2,6 metros. ¿Qué necesito?' },
  { em: '🪚', title: '¿Tenés que cortar madera?', sub: 'Te dice qué sierra y qué más usar.', prompt: 'Tengo que cortar unas tablas de madera para hacer un estante, ¿qué me llevo?' },
  { em: '🔌', title: 'Se te derritió un enchufe', sub: 'Te arma el repuesto correcto y seguro.', caseId: 'caso4' },
  { em: '🚰', title: 'Pierde agua la pileta', sub: 'Aunque no sepas cómo se llama la pieza.', caseId: 'caso1' },
];

const CHIPS = [
  'Se me rompió el cosito de la canilla',
  'Quiero colgar un cuadro pesado',
  'Tengo que cortar tablas de madera',
  'Ya tengo rodillo',
  'Sí, agregalo',
];

const state = { catalog: {}, messages: [], kit: [], cart: [], busy: false, pendingImage: null, lastUserText: '' };

// ---------- bootstrap ----------
async function init() {
  try {
    const list = await (await fetch('/api/catalog')).json();
    for (const p of list) state.catalog[p.id] = p;
  } catch { /* catalog images are optional */ }
  renderCases();
  renderOffers();
  renderChips();
  bot('¡Hola! Soy <b>Ferrelisto</b>, tu vendedor de ferretería con IA 👋 Contame qué se te rompió o qué querés arreglar, como te salga. También podés mandarme una foto o un audio.');
  bindUI();
}

function renderCases() {
  $('#caseList').innerHTML = CASES.map((c) => `
    <li class="case">
      <img class="case-thumb" src="/demo/${c.id}.jpg" alt="" onerror="this.remove()" />
      <span class="case-title">${c.icon} ${c.title}</span>
      <button class="load-case" data-case="${c.id}" type="button">▶ Cargar caso</button>
      <span class="case-quote">"${c.text}"</span>
      <span class="case-links">
        <a href="/demo/${c.id}.jpg" target="_blank" rel="noopener" download>📷 Foto del problema</a>
        <a href="/demo/${c.id}.mp3" target="_blank" rel="noopener" download>🎧 Audio del cliente</a>
      </span>
    </li>`).join('');
  // Hide download links for demo files that are not published yet.
  document.querySelectorAll('.case-links a').forEach((a) => {
    fetch(a.getAttribute('href'), { method: 'HEAD' }).then((r) => { if (!r.ok) a.remove(); }).catch(() => a.remove());
  });
  $('#caseList').addEventListener('click', (e) => {
    const b = e.target.closest('.load-case');
    if (b) { $('#cases').open = false; loadCase(b.dataset.case); }
  });
}

function renderOffers() {
  $('#offerGrid').innerHTML = OFFERS.map((o, i) => `
    <button class="offer-card" data-i="${i}" type="button">
      <span class="em">${o.em}</span>
      <span><b>${o.title}</b><small>${o.sub}</small><span class="try">Probalo →</span></span>
    </button>`).join('');
  $('#offerGrid').addEventListener('click', (e) => {
    const b = e.target.closest('.offer-card');
    if (!b) return;
    const o = OFFERS[b.dataset.i];
    closeWelcome();
    if (o.caseId) loadCase(o.caseId); else send(o.prompt);
  });
}

function renderChips() {
  $('#chips').innerHTML = CHIPS.map((c) => `<button type="button">${c}</button>`).join('');
  $('#chips').addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });
}

function closeWelcome() { $('#welcome').classList.add('hidden'); $('#textInput').focus(); }

function bindUI() {
  $('#closeWelcome').onclick = closeWelcome;
  $('#startBtn').onclick = closeWelcome;
  $('#composer').addEventListener('submit', (e) => { e.preventDefault(); send($('#textInput').value); });
  $('#imageInput').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) return bot('La foto es muy pesada (máx. 12 MB).', { error: true });
    state.pendingImage = await shrinkImage(f);
    $('#attachPreview').innerHTML = `<img src="${state.pendingImage}" alt="" /> Foto lista. Contame qué querés hacer o enviala así. <button type="button" id="rmImg">✕</button>`;
    $('#attachPreview').classList.remove('hidden');
    $('#rmImg').onclick = clearImage;
    $('#textInput').focus();
  });
  $('#audioInput').addEventListener('change', (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (f) sendAudio(f, URL.createObjectURL(f));
  });
  $('#micBtn').onclick = toggleRecording;
  $('#addKitBtn').onclick = () => { if (state.kit.length) addToCart(state.kit); };
  $('#cartBtn').onclick = openCart;
  $('#closeCart').onclick = closeCart;
  $('#drawerShade').onclick = closeCart;
  $('#checkoutBtn').onclick = checkout;
  $('#newOrder').onclick = () => { $('#success').classList.add('hidden'); resetCounter(); };
  $('#tools').addEventListener('click', ownHandler);
  $('#materials').addEventListener('click', ownHandler);
  $('#cartList').addEventListener('click', (e) => {
    const b = e.target.closest('.rm');
    if (b) { state.cart = state.cart.filter((c) => c.id !== b.dataset.id); renderCart(); }
  });
}

function clearImage() { state.pendingImage = null; $('#attachPreview').classList.add('hidden'); }

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- chat ----------
function scrollChat() { const m = $('#messages'); m.scrollTop = m.scrollHeight; }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function userBubble({ text, image, audioUrl }) {
  const d = document.createElement('div');
  d.className = 'msg user';
  d.innerHTML = (image ? `<img class="thumb" src="${image}" alt="foto enviada" />` : '')
    + (audioUrl ? `<audio controls src="${audioUrl}"></audio><span class="transcript">🎧 Transcripción:</span>` : '')
    + esc(text || (image ? 'Te mando una foto.' : ''));
  $('#messages').appendChild(d); scrollChat();
}

function bot(html, { error = false, fallback = false, actions = [], quick = false } = {}) {
  const d = document.createElement('div');
  d.className = 'msg bot' + (error ? ' error' : '');
  const chips = actions.map((a, i) => `<span class="action-chip" style="animation-delay:${i * 0.15}s">${actionLabel(a)}</span>`).join('');
  d.innerHTML = `<span class="who">Ferrelisto · vendedor IA</span>${html}`
    + (chips ? `<div class="actions-row">${chips}</div>` : '')
    + (fallback ? '<span class="fallback-tag">fallback: IA no disponible</span>' : '')
    + (quick ? '<div class="quick"><button class="yes" type="button">✅ Sí, agregalo</button><button class="no" type="button">Ya tengo algunas herramientas</button></div>' : '');
  if (quick) {
    d.querySelector('.yes').onclick = () => send('Sí, agregalo');
    d.querySelector('.no').onclick = () => { $('#textInput').value = 'Ya tengo '; $('#textInput').focus(); };
  }
  const row = document.createElement('div');
  row.className = 'botrow';
  row.innerHTML = '<img class="avatar" src="/img/logo.png" alt="Ferrelisto" />';
  row.appendChild(d);
  $('#messages').appendChild(row); scrollChat();
}

function actionLabel(a) {
  switch (a.type) {
    case 'show_diagnosis': return '🔎 Diagnóstico';
    case 'calculate_paint': return `🧮 Cálculo: ${fmt(a.area_m2)} m² → ${fmt(a.liters)} L`;
    case 'show_kit': return `📦 Kit armado (${a.items.length})`;
    case 'remove_item': return `➖ Quitado: ${a.ids.map((id) => state.catalog[id]?.name?.split(' ')[0] || id).join(', ')}`;
    case 'add_to_cart': return '🛒 Agregado al carrito';
    default: return a.type;
  }
}
const fmt = (n) => String(n).replace('.', ',');

function setBusy(b) {
  state.busy = b;
  $('#sendBtn').disabled = b;
  let t = $('#typing');
  if (b && !t) {
    t = document.createElement('div'); t.id = 'typing'; t.className = 'typing';
    t.innerHTML = '<img class="avatar sm" src="/img/logo.png" alt="" /> Ferrelisto está mirando tu problema <b>.</b><b>.</b><b>.</b>';
    $('#messages').appendChild(t); scrollChat();
  } else if (!b && t) t.remove();
  $('#thinking').classList.toggle('hidden', !b);
  if (b) $('#empty').classList.add('hidden');
}

async function send(text, extra = {}) {
  text = (text || '').trim();
  const image = extra.image || state.pendingImage;
  if (state.busy || (!text && !image)) return;
  $('#textInput').value = '';
  if (!extra.audioUrl) userBubble({ text, image });
  else userBubble({ text, audioUrl: extra.audioUrl, image });
  clearImage();
  state.lastUserText = text || 'Foto del problema';
  state.messages.push({ role: 'user', content: text || 'Te mando una foto del problema, ¿qué necesito?', image });
  setBusy(true);
  try {
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: state.messages.map((m, i) => ({ ...m, image: i === state.messages.length - 1 ? m.image : undefined })),
        kit: state.kit.map((k) => ({ id: k.id, qty: k.qty, reason: k.reason, essential: k.essential })),
        cart: state.cart.map((c) => c.id),
      }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { state.messages.pop(); return bot(esc(j.error || 'Algo falló, probá de nuevo.'), { error: true }); }
    state.messages.push({ role: 'assistant', content: j.reply });
    const hasKit = j.actions.some((a) => a.type === 'show_kit' || a.type === 'remove_item');
    const added = j.actions.some((a) => a.type === 'add_to_cart');
    bot(esc(j.reply.replace(/\s*\(fallback: IA no disponible\)/, '')), { fallback: j.fallback, actions: j.actions, quick: hasKit && !added });
    await playActions(j.actions);
  } catch {
    setBusy(false);
    state.messages.pop();
    bot('No me pude conectar. Revisá la conexión y probá de nuevo.', { error: true });
  }
}

async function loadCase(id) {
  const c = CASES.find((x) => x.id === id);
  if (!c || state.busy) return;
  let image;
  try {
    const r = await fetch(`/demo/${id}.jpg`);
    if (r.ok) image = await shrinkImage(await r.blob());
  } catch { /* no photo for this case */ }
  try {
    const r = await fetch(`/demo/${id}.mp3`);
    if (!r.ok) throw new Error('no audio');
    const blob = await r.blob();
    await sendAudio(blob, `/demo/${id}.mp3`, { fallbackText: c.text, image });
  } catch {
    send(c.text, { image });
  }
}

// ---------- audio ----------
async function sendAudio(blob, url, { fallbackText = '', image } = {}) {
  if (state.busy) return;
  if (blob.size > 6 * 1024 * 1024) return bot('El audio es muy largo (máx. 6 MB).', { error: true });
  setBusy(true);
  $('#typing') && ($('#typing').innerHTML = '<img class="avatar sm" src="/img/logo.png" alt="" /> Escuchando el audio <b>.</b><b>.</b><b>.</b>');
  let text = '';
  try {
    const r = await fetch('/api/transcribe', { method: 'POST', headers: { 'content-type': blob.type || 'audio/mpeg' }, body: blob });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    text = j.text;
  } catch (err) {
    text = fallbackText;
    if (!text) { setBusy(false); return bot(esc(err.message || 'No pude entender el audio.'), { error: true }); }
  }
  setBusy(false);
  send(text, { audioUrl: url, image });
}

let recorder = null;
async function toggleRecording() {
  if (recorder) { recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      $('#micBtn').classList.remove('rec');
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      recorder = null;
      if (blob.size > 1000) sendAudio(blob, URL.createObjectURL(blob));
    };
    recorder.start();
    $('#micBtn').classList.add('rec');
  } catch {
    recorder = null;
    bot('No pude acceder al micrófono. Podés subir un audio con 🎵.', { error: true });
  }
}

// ---------- counter (right panel) ----------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function playActions(actions) {
  for (const a of actions) {
    if (a.type === 'show_diagnosis') showDiagnosis(a);
    else if (a.type === 'calculate_paint') showCalc(a);
    else if (a.type === 'show_kit') showKit(a.items);
    else if (a.type === 'remove_item') await removeItems(a.ids);
    else if (a.type === 'add_to_cart') await addToCart(a.items);
    await wait(350);
  }
}

function showDiagnosis(a) {
  $('#empty').classList.add('hidden');
  $('#diagSaid').textContent = `"${state.lastUserText.slice(0, 160)}${state.lastUserText.length > 160 ? '…' : ''}"`;
  $('#diagDetected').textContent = a.detected;
  $('#diagSolution').textContent = a.solution;
  const d = $('#diagnosis');
  d.classList.remove('hidden'); d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
}

function showCalc(a) {
  const cans = a.cans.map((c) => `${c.qty} × ${state.catalog[c.id]?.name.match(/\d+ L/)?.[0] || c.id}`).join(' + ');
  $('#calc').innerHTML = `
    <div class="metric"><small>Superficie</small><strong>${fmt(a.width_m)} × ${fmt(a.height_m)} = ${fmt(a.area_m2)} m²</strong></div>
    <div class="metric"><small>Manos</small><strong>${a.coats}</strong></div>
    <div class="metric"><small>Pintura necesaria</small><strong>${fmt(a.liters)} L</strong></div>
    <div class="metric hl"><small>Te llevás</small><strong>${cans}</strong></div>`;
  $('#calc').classList.remove('hidden');
}

function productVisual(p) {
  const img = state.catalog[p.id]?.img;
  return img ? `<img src="${img}" alt="${esc(p.name)}" loading="lazy" />` : (p.icon || state.catalog[p.id]?.icon || '📦');
}

function cardHtml(p, i, isNew) {
  return `<div class="card ${p.type}${isNew ? ' new-badge' : ''}" data-id="${p.id}" style="animation-delay:${i * 0.12}s">
    <div class="ph"><span class="tbadge">${p.type === 'tool' ? 'Herramienta' : 'Material'}</span><div class="obj${state.catalog[p.id]?.img ? ' has-img' : ''}">${productVisual(p)}</div>${state.catalog[p.id]?.img ? '' : '<div class="floor"></div>'}</div>
    <div class="body">
      <div class="name">${esc(p.name)}</div>
      <div class="why">${esc(p.reason || '')}</div>
      <div class="row"><span class="qty">x${p.qty}</span><span class="price">${money(p.price * p.qty)}</span></div>
      <button class="own" type="button" data-id="${p.id}">Ya lo tengo</button>
    </div>
  </div>`;
}

function showKit(items) {
  const before = new Set(state.kit.map((k) => k.id));
  const hadKit = state.kit.length > 0;
  state.kit = items;
  $('#empty').classList.add('hidden');
  const mats = items.filter((p) => p.essential !== false);
  const tools = items.filter((p) => p.essential === false);
  $('#materials').innerHTML = mats.map((p, i) => cardHtml(p, i, hadKit && !before.has(p.id))).join('') || '<span class="empty-hint">—</span>';
  $('#tools').innerHTML = tools.map((p, i) => cardHtml(p, i + mats.length, hadKit && !before.has(p.id))).join('') || '<span class="empty-hint">Nada más: con lo de arriba alcanza.</span>';
  $('#kit').classList.remove('hidden');
  $('#addKitBtn').disabled = false; $('#addKitBtn').classList.remove('done'); $('#addKitBtn').textContent = '🛒 Agregar kit al carrito';
  updateKitTotal();
}

function updateKitTotal() { $('#kitTotal').textContent = money(state.kit.reduce((s, p) => s + p.price * p.qty, 0)); }

async function removeItems(ids) {
  for (const id of ids) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      card.insertAdjacentHTML('beforeend', '<div class="stamp">✓ Ya lo tenés</div>');
      await wait(500);
      card.classList.add('leaving');
      await wait(380);
      card.remove();
    }
  }
  state.kit = state.kit.filter((k) => !ids.includes(k.id));
  if (!$('#tools').children.length) $('#tools').innerHTML = '<span class="empty-hint">Nada más: con lo de arriba alcanza.</span>';
  updateKitTotal();
}

function ownHandler(e) {
  const b = e.target.closest('.own');
  if (b) removeItems([b.dataset.id]);
}

// ---------- cart ----------
async function addToCart(items) {
  const target = $('#cartBtn').getBoundingClientRect();
  const flights = [];
  items.forEach((p, i) => {
    const card = document.querySelector(`.card[data-id="${p.id}"]`);
    if (!card) return;
    const r = card.querySelector('.ph').getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'flyer';
    f.innerHTML = productVisual(p);
    f.style.left = `${r.left + r.width / 2 - 35}px`; f.style.top = `${r.top + r.height / 2 - 35}px`;
    document.body.appendChild(f);
    flights.push(new Promise((res) => setTimeout(() => {
      f.style.transform = `translate(${target.left + target.width / 2 - (r.left + r.width / 2)}px, ${target.top + target.height / 2 - (r.top + r.height / 2)}px) scale(.25) rotate(20deg)`;
      f.style.opacity = '.3';
      setTimeout(() => { f.remove(); res(); }, 820);
    }, i * 140)));
  });
  await Promise.all(flights);
  for (const p of items) {
    const ex = state.cart.find((c) => c.id === p.id);
    if (ex) ex.qty += p.qty; else state.cart.push({ id: p.id, name: p.name, price: p.price, qty: p.qty, type: p.type, icon: p.icon });
  }
  renderCart();
  $('#cartBtn').classList.remove('bump'); void $('#cartBtn').offsetWidth; $('#cartBtn').classList.add('bump');
  $('#addKitBtn').disabled = true; $('#addKitBtn').classList.add('done'); $('#addKitBtn').textContent = '✓ Kit en el carrito';
  await wait(250);
  openCart();
}

function cartTotal() { return state.cart.reduce((s, c) => s + c.price * c.qty, 0); }

function renderCart() {
  $('#cartList').innerHTML = state.cart.length
    ? state.cart.map((c) => `<li><span class="ic">${productVisual(c)}</span><span class="nm">${esc(c.name)}<small>x${c.qty} · ${money(c.price)} c/u</small></span><span class="pr">${money(c.price * c.qty)}</span><button class="rm" data-id="${c.id}" type="button" aria-label="Quitar">✕</button></li>`).join('')
    : '<li class="empty-hint">Tu carrito está vacío. Contale tu problema a Ferrelisto.</li>';
  const total = cartTotal();
  $('#cartTotal').textContent = money(total);
  $('#cartTotalTop').textContent = money(total);
  $('#cartCount').textContent = state.cart.reduce((s, c) => s + c.qty, 0);
  $('#checkoutBtn').disabled = !state.cart.length;
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#drawerShade').classList.remove('hidden'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#drawerShade').classList.add('hidden'); }

function checkout() {
  if (!state.cart.length) return;
  $('#orderId').textContent = '#FL-' + Math.floor(1000 + Math.random() * 9000);
  $('#orderList').innerHTML = state.cart.map((c) => `<li><span>${c.qty} × ${esc(c.name)}</span><b>${money(c.price * c.qty)}</b></li>`).join('');
  $('#orderTotal').textContent = money(cartTotal());
  closeCart();
  $('#success').classList.remove('hidden');
  state.cart = []; renderCart();
}

function resetCounter() {
  state.kit = []; state.messages = [];
  ['#diagnosis', '#calc', '#kit'].forEach((s) => $(s).classList.add('hidden'));
  $('#empty').classList.remove('hidden');
  $('#messages').innerHTML = '';
  bot('¡Listo! ¿Qué más necesitás arreglar?');
}

renderCart();
init();
