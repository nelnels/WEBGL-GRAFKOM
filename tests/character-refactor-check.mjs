import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import * as primitives from '../src/geometry/primitives.js';
import {createPooh} from '../src/characters/pooh/index.js';
import {createPiglet} from '../src/characters/piglet/index.js';

// Protect the accepted model and animation; refresh snapshots only for intended model edits.
const snapshots = {};
for (const [id, build] of [['pooh', createPooh], ['piglet', createPiglet]]) {
  const character = build(primitives);
  const hash = createHash('sha256');
  for (const t of [0, .7, 3, 12, 41, 60]) {
    character.update(t);
    character.root.updateWorld();
    character.root.traverse(mesh => {
      if (!mesh.geometry) return;
      const g = mesh.geometry;
      hash.update(JSON.stringify([Array.from(mesh.world), g.type, Array.from(g.positions), Array.from(g.normals), Array.from(g.indices), mesh.material]));
    });
  }
  snapshots[id] = hash.digest('hex');
  if (!process.argv.includes('--record')) character.root.traverse(mesh => {
    if (!mesh.geometry) return;
    assert(mesh.name.startsWith(character.root.name + '-'), 'Every highlighted mesh needs a character part name');
    assert(mesh.sourceFile?.endsWith('.js'), 'Every highlighted mesh needs its source module');
  });
}
const fixture = new URL('./character-models.json', import.meta.url);
if (process.argv.includes('--record')) fs.writeFileSync(fixture, JSON.stringify(snapshots, null, 2) + '\n');
else assert.deepEqual(snapshots, JSON.parse(fs.readFileSync(fixture, 'utf8')), 'Model geometry, materials, mesh order and animated world transforms must be preserved');
console.log('Character appearance, animation and geometry inventory passed.');
