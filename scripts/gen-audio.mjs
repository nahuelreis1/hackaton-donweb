// Generates the 5 demo customer voice notes with ElevenLabs TTS (run once, output committed).
import { writeFileSync } from 'node:fs';
const key = process.env.ELEVENLABS_API_KEY;
const voice = process.env.ELEVEN_VOICE_ID || 'ByVRQtaK1WDOvTmP1PKO';
const cases = {
  caso1: 'Hola, me pierde agua el cosito blanco doblado que está abajo de la pileta de la cocina, está todo flojo, ¿qué le tengo que poner?',
  caso2: 'Quiero arreglar y pintar una pared de mi pieza que mide 4 por 3 metros y se me descascaró abajo por la humedad, ¿qué compro y cuánta pintura necesito?',
  caso3: 'Necesito colgar el soporte de una tele grande en el departamento, pero la pared es de ladrillo hueco y los tornillos comunes me bailan y se salen.',
  caso4: 'Enchufé el caloventor y se me derritió el plástico del enchufe de la pared, ¿qué tengo que comprar para cambiarlo y que no se vuelva a quemar?',
  caso5: 'Se me salió la bisagra de la puerta de la alacena de la cocina y quedaron los agujeros todos agrandados en la madera, ya no agarra ningún tornillo.',
};
for (const [id, text] of Object.entries(cases)) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', language_code: 'es' }),
  });
  if (!r.ok) { console.log(id, 'FAIL', r.status, (await r.text()).slice(0, 200)); continue; }
  writeFileSync(`public/demo/${id}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log(id, 'ok');
}
