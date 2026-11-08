import assert from 'node:assert/strict';
import {createDoorwaySet,DOOR_X} from '../src/scene/doorway-set.js';
const {root:set}=createDoorwaySet();set.updateWorld();
assert(set.getObjectByName('Honey-inside'));assert(set.getObjectByName('Honey-outside'));
// The opening is empty: side walls must stop outside the middle of the doorway.
for(const [name,side]of [['Door-wall-near',1],['Door-wall-far',-1]]){
 const wall=set.getObjectByName(name),p=wall.geometry.positions;
 for(let i=2;i<p.length;i+=3)assert(side*(p[i]+wall.position.z)>=.79);
 assert(Math.abs(wall.position.x-DOOR_X)<.01);
}
set.traverse(m=>{assert([...m.world].every(Number.isFinite));if(m.geometry){assert([...m.geometry.positions,...m.geometry.normals].every(Number.isFinite));assert(m.geometry.indices.every(i=>i<m.geometry.positions.length/3));}});
console.log('Doorway set: valid geometry, real opening, honey pots and finite transforms passed.');
