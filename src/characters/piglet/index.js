import {Node} from '../../core/webgl.js';
import * as primitives from '../../geometry/primitives.js';
import {createCharacterHelpers} from '../../geometry/character-helpers.js';
import {buildMaterials} from './materials.js';
import {buildTorso} from './torso.js';
import {buildHead} from './head.js';
import {buildLimbs} from './limbs.js';

export function createPiglet(helpers=primitives) {
  const materials=buildMaterials(helpers.black);
  const geometry=createCharacterHelpers('Piglet',helpers);
  const root = new Node(); root.name = 'Piglet';
  const body = new Node(); body.name = 'Piglet-body'; root.add(body);
  buildTorso(body,geometry,materials);
  const {head,ears}=buildHead(body,geometry,materials);
  const {arms,legs}=buildLimbs(body,geometry,materials);
  return {
    root,
    body,
    parts:{head,arms,legs},
    view: {target:[0,.9,0],height:7.4,halfWidth:2.8},
    update(t) {
      const walk=Math.sin(t*2.5);
      body.rotation.z=Math.sin(t*1.25)*.025;
      head.rotation.y=Math.sin(t*.85)*.16;
      head.rotation.z=.055+Math.sin(t*1.2)*.025;
      arms[0].rotation.x=walk*.20; arms[1].rotation.x=-walk*.20;
      legs[0].rotation.x=-walk*.10; legs[1].rotation.x=walk*.10;
      ears[0].rotation.z=.9+Math.sin(t*2)*.065;
      ears[1].rotation.z=-.9+Math.sin(t*2+.8)*.065;
    }
  };
}
