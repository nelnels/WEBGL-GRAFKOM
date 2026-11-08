import assert from 'node:assert/strict';
import {createEnvironment} from '../src/scene/environment.js';
import {createDoorwaySet,DOOR_X} from '../src/scene/doorway-set.js';
const environment=createEnvironment();
assert(environment.getObjectByName('Woodland-bridge'));
assert(environment.getObjectByName('Rescue-oak'));
assert(environment.getObjectByName('Pooh-woodland-home'));
for(const time of [0,12,41,60]){
 environment.update(time);environment.updateWorld();
 environment.traverse(n=>{
  assert([...n.world].every(Number.isFinite));
  if(!n.geometry)return;
  const g=n.geometry;assert([...g.positions,...g.normals].every(Number.isFinite));
  assert(g.indices.every(index=>index<g.positions.length/3));
 });
}
const {root:set}=createDoorwaySet();set.updateWorld();
assert(set.getObjectByName('Honey-inside'));assert(set.getObjectByName('Honey-outside'));
// The opening is empty: side walls must stop outside the middle of the doorway.
for(const [name,side]of [['Door-wall-near',1],['Door-wall-far',-1]]){
 const wall=set.getObjectByName(name),p=wall.geometry.positions;
 for(let i=2;i<p.length;i+=3)assert(side*(p[i]+wall.position.z)>=.79);
 assert(Math.abs(wall.position.x-DOOR_X)<.01);
}
set.traverse(m=>{assert([...m.world].every(Number.isFinite));if(m.geometry){assert([...m.geometry.positions,...m.geometry.normals].every(Number.isFinite));assert(m.geometry.indices.every(i=>i<m.geometry.positions.length/3));}});
console.log('Environment and doorway set: valid geometry, real opening, honey pots and finite transforms passed.');
