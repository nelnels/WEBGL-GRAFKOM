import {Node} from '../../core/webgl.js';
import * as primitives from '../../geometry/primitives.js';
import {createCharacterHelpers} from '../../geometry/character-helpers.js';
import {buildMaterials} from './materials.js';
import {buildTorso} from './torso.js';
import {buildHead} from './head.js';
import {buildLimbs} from './limbs.js';

export function createPooh(helpers=primitives) {
  const materials=buildMaterials(helpers.black);
  const geometry=createCharacterHelpers('Pooh',helpers);
  const root=new Node('Pooh'),body=new Node('Pooh-body');body.position.y=.05;root.add(body);
  buildTorso(body,geometry,materials);
  const head=buildHead(body,geometry,materials);
  const {arms,legs}=buildLimbs(body,geometry,materials);
  return {
    root,
    body,
    parts:{head,arms,legs},
    view:{target:[0,1.5,0],height:10,halfWidth:3.8},
    update(t) {
      body.rotation.z=Math.sin(t*1.3)*.018;
      head.rotation.y=Math.sin(t*.8)*.10;
    }
  };
}
