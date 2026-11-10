import {material} from './core/webgl.js';

// UI bersama halaman karakter. Modul karakter tetap bebas dari DOM.
const PRIMITIVES = {
  ellipsoid: {
    title: 'Ellipsoid', color: 0x2786c4,
    formula: '(x/a)² + (y/b)² + (z/c)² = 1'
  },
  'elliptic-paraboloid': {
    title: 'Paraboloid', color: 0xbc538c,
    formula: 'z = d · (1 − x²/a² − (y−cy)²/b²)'
  },
  cylinder: {
    title: 'Cylinder', color: 0xd17b24,
    formula: 'x² + z² = r²; radius atas = radius bawah'
  },
  curve: {
    title: 'Curve 3D', color: 0x349275,
    formula: 'Catmull–Rom → tubeGeometry()'
  },
  parametric: {
    title: 'Surface bebas', color: 0x8265b3,
    formula: 'P(u,v) = (x(u,v), y(u,v), z(u,v)); bukan quadric'
  }
};

// Daftar bagian berasal dari mesh aktual, bukan daftar anatomi yang ditulis ulang.
export function collectParts(character) {
  const inventory = new Map();
  character.root.traverse(mesh => {
    if (!mesh.geometry) return;
    const type = mesh.geometry.type;
    const part = mesh.name
      .replace(/^(?:Tigger|Piglet|Pooh)-(ellipsoid|elliptic-paraboloid|paraboloid|cylinder|curve|surface|parametric)-/, '')
      .replace(/^Tigger-front-paw-/, 'telapak-tangan-')
      .replace(/-near(?=-|$)/g, '-dekat').replace(/-far(?=-|$)/g, '-jauh')
      .replace(/-(front|back)$/, '').replace(/-\d+(?=-|$)/g, '')
      .replace(/-+/g, ' ').trim();
    const source = mesh.sourceFile;
    if (!inventory.has(type)) inventory.set(type, new Map());
    const group = inventory.get(type), key = `${source}:${part}`;
    if (!group.has(key)) group.set(key, {part, source, count: 0});
    group.get(key).count++;
  });
  return inventory;
}

function describeParts(inventory, type) {
  const parts = [...(inventory.get(type)?.values() || [])];
  const total = parts.reduce((sum, part) => sum + part.count, 0);
  return `${total} mesh · ${parts.length} bagian unik. ` + parts
    .map(({part, source, count}) => `${part} (${count}) — ${source}`)
    .join('; ');
}

export function setupCharacterPresentation(character) {
  const toggle = document.querySelector('#geometry-toggle');
  const panel = document.querySelector('#geometry-guide');
  const description = document.querySelector('#geometry-description');
  const formula = document.querySelector('#geometry-formula');
  const buttons = [...panel.querySelectorAll('[data-primitive]')];
  const inventory = collectParts(character);
  const curveTypes = new Set();
  character.root.traverse(mesh => {
    if (mesh.geometry?.type === 'curve') curveTypes.add(mesh.geometry.parameters.curve === 'bezier' ? 'Bézier' : 'Catmull–Rom');
  });
  const originals = new Map();
  character.root.traverse(mesh => { if (mesh.geometry) originals.set(mesh, mesh.material); });
  const neutral = material({color: 0xb8b6ab, roughness: .85});
  const highlights = Object.fromEntries(Object.entries(PRIMITIVES).map(([type, info]) => [type, material({color: info.color})]));

  function select(type) {
    for (const [mesh, original] of originals) {
      mesh.material = type === 'original' ? original : mesh.geometry.type === type ? highlights[type] : neutral;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.primitive === type)));
    const info = PRIMITIVES[type];
    formula.textContent = info ? type === 'curve' ? [...curveTypes].join(' / ') + ' → tubeGeometry()' : info.formula : 'WebGL murni · semua bentuk dibuat lewat kode';
    description.textContent = info ? describeParts(inventory, type) : 'Pilih primitive untuk menyorot bagian model. Warna abu-abu menunjukkan bagian lainnya. G menutup panel dan mengembalikan warna asli.';
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Tutup geometri · G' : 'Jelajahi geometri · G';
    if (!open) select('original');
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.primitive)));
  window.addEventListener('keydown', event => {
    if (event.code !== 'KeyG' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    event.preventDefault();
    setOpen(panel.hidden);
  });
  select('original');
}
