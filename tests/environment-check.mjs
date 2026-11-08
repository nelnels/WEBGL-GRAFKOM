import assert from 'node:assert/strict';
import {createEnvironment} from '../src/scene/environment.js';
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
console.log('Environment: bridge, rescue oak, home, valid geometry and animated transforms passed.');
