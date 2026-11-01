// Store catalog: the model may only recommend ids from this list.
export const CATALOG = [
  // Plumbing
  { id: 'sifon', name: 'Sifón extensible universal PVC blanco', type: 'material', price: 8900, cat: 'plomeria', icon: '🚰' },
  { id: 'teflon', name: 'Cinta de teflón alta densidad', type: 'material', price: 1500, cat: 'plomeria', icon: '🧵' },
  { id: 'silicona', name: 'Sellador de silicona antihongos', type: 'material', price: 6200, cat: 'plomeria', icon: '🧴' },
  { id: 'pinza', name: 'Pinza pico de loro ajustable', type: 'tool', price: 14500, cat: 'plomeria', icon: '🔧' },
  // Paint
  { id: 'latex4', name: 'Látex interior antihongos blanco 4 L', type: 'material', price: 32000, cat: 'pintura', icon: '🪣' },
  { id: 'latex1', name: 'Látex interior antihongos blanco 1 L', type: 'material', price: 9800, cat: 'pintura', icon: '🪣' },
  { id: 'enduido', name: 'Enduido plástico interior 1 kg', type: 'material', price: 5400, cat: 'pintura', icon: '🥣' },
  { id: 'fijador', name: 'Fijador sellador al agua 1 L', type: 'material', price: 7600, cat: 'pintura', icon: '🧪' },
  { id: 'rodillo', name: 'Rodillo de lana sintética', type: 'tool', price: 8500, cat: 'pintura', icon: '🧻' },
  { id: 'espatula', name: 'Espátula metálica flexible + lija', type: 'tool', price: 4900, cat: 'pintura', icon: '🛠️' },
  { id: 'esmalte', name: 'Esmalte sintético blanco 1 L', type: 'material', price: 14200, cat: 'pintura', icon: '🎨' },
  { id: 'pincel', name: 'Pincel cerda natural 2"', type: 'tool', price: 3300, cat: 'pintura', icon: '🖌️' },
  { id: 'cinta_papel', name: 'Cinta de enmascarar 24 mm', type: 'material', price: 1900, cat: 'pintura', icon: '📜' },
  // Fixings
  { id: 'tarugos', name: 'Tarugos de expansión para ladrillo hueco (pack x8)', type: 'material', price: 4200, cat: 'fijaciones', icon: '🔩' },
  { id: 'tirafondos', name: 'Tornillos tirafondos hexagonales con arandela (pack x8)', type: 'material', price: 3800, cat: 'fijaciones', icon: '🔩' },
  { id: 'mecha10', name: 'Mecha de widia 10 mm para pared', type: 'tool', price: 3600, cat: 'fijaciones', icon: '🌀' },
  { id: 'nivel', name: 'Nivel de mano con burbuja', type: 'tool', price: 7200, cat: 'fijaciones', icon: '📏' },
  { id: 'taladro', name: 'Taladro percutor 13 mm 750 W', type: 'tool', price: 74500, cat: 'fijaciones', icon: '🔌' },
  // Electrical
  { id: 'toma20', name: 'Tomacorriente reforzado 20 A (tapa + bastidor + módulo)', type: 'material', price: 9500, cat: 'electricidad', icon: '🔌' },
  { id: 'aisladora', name: 'Cinta aisladora ignífuga negra', type: 'material', price: 1200, cat: 'electricidad', icon: '⚫' },
  { id: 'cable25', name: 'Cable eléctrico normalizado 2,5 mm (rollo 10 m)', type: 'material', price: 18900, cat: 'electricidad', icon: '〰️' },
  { id: 'destaislado', name: 'Destornillador aislado + buscapolo', type: 'tool', price: 6800, cat: 'electricidad', icon: '🪛' },
  { id: 'lampara', name: 'Lámpara LED 12 W luz fría', type: 'material', price: 2400, cat: 'electricidad', icon: '💡' },
  // Hardware and furniture
  { id: 'bisagras', name: 'Par de bisagras cazoleta de acero', type: 'material', price: 5600, cat: 'herrajes', icon: '🚪' },
  { id: 'placa', name: 'Placa reparadora inoxidable con tornillos', type: 'material', price: 2900, cat: 'herrajes', icon: '🔲' },
  { id: 'masilla', name: 'Masilla plástica reparadora para madera', type: 'material', price: 3400, cat: 'herrajes', icon: '🫙' },
  { id: 'phillips', name: 'Destornillador Phillips imantado', type: 'tool', price: 4100, cat: 'herrajes', icon: '🪛' },
  // Woodwork
  { id: 'serrucho', name: 'Serrucho de carpintero 20"', type: 'tool', price: 12900, cat: 'carpinteria', icon: '🪚' },
  { id: 'caladora', name: 'Sierra caladora eléctrica 650 W', type: 'tool', price: 68900, cat: 'carpinteria', icon: '🪚' },
  { id: 'hojas_caladora', name: 'Hojas para caladora, corte madera (pack x5)', type: 'material', price: 5900, cat: 'carpinteria', icon: '🗡️' },
  { id: 'martillo', name: 'Martillo de carpintero 16 oz', type: 'tool', price: 9800, cat: 'carpinteria', icon: '🔨' },
  { id: 'mechas_madera', name: 'Set de mechas para madera (x7)', type: 'tool', price: 8700, cat: 'carpinteria', icon: '🌀' },
  { id: 'tornillos_madera', name: 'Tornillos para madera 4x40 (caja x100)', type: 'material', price: 3900, cat: 'carpinteria', icon: '🔩' },
  { id: 'clavos', name: 'Clavos punta París 2" (1 kg)', type: 'material', price: 3200, cat: 'carpinteria', icon: '📌' },
  { id: 'cola', name: 'Cola vinílica para carpintería 1 kg', type: 'material', price: 6100, cat: 'carpinteria', icon: '🧴' },
  { id: 'lija_madera', name: 'Lija para madera grano 120 (x5)', type: 'material', price: 2500, cat: 'carpinteria', icon: '🟫' },
  { id: 'barniz', name: 'Barniz marino brillante 1 L', type: 'material', price: 15800, cat: 'carpinteria', icon: '🍯' },
  { id: 'metro', name: 'Cinta métrica 5 m', type: 'tool', price: 5200, cat: 'carpinteria', icon: '📐' },
  // Safety
  { id: 'guantes', name: 'Guantes de trabajo reforzados', type: 'tool', price: 3500, cat: 'seguridad', icon: '🧤' },
  { id: 'anteojos', name: 'Anteojos de seguridad', type: 'tool', price: 2800, cat: 'seguridad', icon: '🥽' },
];

export const BY_ID = Object.fromEntries(CATALOG.map((p) => [p.id, p]));

// Paint coverage rule: 2 coats, 10 m2 per liter per coat. Code computes, the model only extracts sizes.
export function calculatePaint(widthM, heightM, coats = 2) {
  const w = Number(widthM), h = Number(heightM), c = Math.min(Math.max(Number(coats) || 2, 1), 4);
  if (!(w > 0 && h > 0 && w <= 50 && h <= 20)) return { error: 'medidas inválidas' };
  const area = Math.round(w * h * 100) / 100;
  const liters = Math.round(((area * c) / 10) * 10) / 10;
  let cans;
  if (liters <= 1) cans = [{ id: 'latex1', qty: 1 }];
  else if (liters <= 4) cans = [{ id: 'latex4', qty: 1 }];
  else {
    const four = Math.floor(liters / 4);
    const rest = liters - four * 4;
    cans = [{ id: 'latex4', qty: rest > 1 ? four + 1 : four }];
    if (rest > 0 && rest <= 1) cans.push({ id: 'latex1', qty: 1 });
  }
  return { width_m: w, height_m: h, coats: c, area_m2: area, liters, cans };
}

export function catalogForPrompt() {
  return CATALOG.map((p) => `${p.id} | ${p.name} | ${p.type === 'tool' ? 'herramienta' : 'material'} | $${p.price} | ${p.cat}`).join('\n');
}
