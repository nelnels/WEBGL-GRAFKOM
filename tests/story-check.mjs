import assert from 'node:assert/strict';
import {Vec3,transformPoint} from '../src/core/webgl.js';
import {createStory} from '../src/animation/story.js';
import {KITE_SNAG} from '../src/scene/environment.js';
const story=createStory();
assert.equal(story.characters.length,3);
assert(story.kite,'the rescue must have a visible kite');
assert.equal(story.update(4).kiteState,'flying');
assert.equal(story.update(14).kiteState,'stuck');
assert.equal(story.update(28).kiteState,'stuck','first attempts cannot free the kite');
assert.equal(story.update(43).kiteState,'rescued');
story.update(41);assert(story.kite.position.distanceTo(transformPoint(story.root.getObjectByName('Tigger-front-paw-near').world,new Vec3()))<.01,'paw actually reaches kite at rescue');
assert(transformPoint(story.root.getObjectByName('Tigger-front-paw-near').world,new Vec3()).distanceTo(new Vec3(...KITE_SNAG))<.01,'rescue paw must meet the actual branch');
assert.equal(story.update(54).kiteState,'flying','the ending must resolve the problem');
story.update(14);const snag=story.kite.position.clone();story.update(28);assert(story.kite.position.distanceTo(snag)<.15,'kite stays on branch during failed attempts');
let min=Infinity,max=-Infinity,axis=0,highest=0;
for(let frame=0;frame<=1800;frame++){
 const t=frame/30,state=story.update(t);story.root.updateWorld();assert.equal(state.ended,t>=60);
 story.root.traverse(n=>assert([...n.world].every(Number.isFinite)));
 const tiger=story.characters[2].root;min=Math.min(min,tiger.scale.y);max=Math.max(max,tiger.scale.y);axis=Math.max(axis,Math.abs(tiger.axisAngle));
 if(t>=39&&t<=43)highest=Math.max(highest,tiger.position.y);
}
assert(max-min>.08,'preparation must retain its scaling demonstration');assert(axis>.1,'leap uses arbitrary axis');assert(highest>1,'rescue jump reaches the branch');
story.update(60);const end=story.characters.map(c=>c.root.position.toArray());story.update(100);assert.deepEqual(story.characters.map(c=>c.root.position.toArray()),end);
story.update(7);const first=story.kite.position.toArray();story.update(55);story.update(7);assert.deepEqual(story.kite.position.toArray(),first,'scrubbing/replay is deterministic');
function lowestVertex(character){
 let lowest=Infinity;
 character.root.traverse(mesh=>{if(!mesh.geometry)return;const p=mesh.geometry.positions,m=mesh.world;
  for(let j=0;j<p.length;j+=3)lowest=Math.min(lowest,m[1]*p[j]+m[5]*p[j+1]+m[9]*p[j+2]+m[13]);
 });return lowest;
}
for(let frame=0;frame<=50;frame++){
 story.update(36+frame/20);const lowest=lowestVertex(story.characters[2]);
 assert(lowest>=-2.27&&lowest<=-2.15,'preparation must keep the feet on the ground');
}
for(let frame=0;frame<=81;frame++){
 story.update(41.6+frame/30);
 assert(lowestVertex(story.characters[2])>=-2.27,'somersault must clear the ground');
}
story.update(42.7);const spinWorld=[];story.characters[2].root.traverse(n=>spinWorld.push([...n.world]));
story.update(10);story.update(42.7);let nodeIndex=0;
story.characters[2].root.traverse(n=>assert.deepEqual([...n.world],spinWorld[nodeIndex++],'leap pose must replay deterministically'));
story.update(44.3);const tiger=story.characters[2].root,spun=[...tiger.world];
assert(Math.abs(tiger.axisAngle-2*Math.PI)<1e-10,'one complete arbitrary-axis turn');
tiger.axisAngle=0;story.root.updateWorld();
assert([...tiger.world].every((v,i)=>Math.abs(v-spun[i])<1e-5),'full turn must finish at identity');
// Bound the complete landing and route, including samples between the keyframes.
let previousTigerPosition=null;
for(let frame=0;frame<=500;frame++){
 const t=35+frame*.05;story.update(t);const tiger=story.characters[2].root;
 const lowest=lowestVertex(story.characters[2]);
 if(t>=39.5&&t<=44.3){
  assert(Math.abs(tiger.scale.x-tiger.scale.y)<1e-6&&Math.abs(tiger.scale.y-tiger.scale.z)<1e-6,'Tigger must keep normal proportions while fetching the kite');
 }
 assert(lowest>=-2.27,'Tigger cannot sink below the floor');
 if(t>=45.5)assert(lowest<=-2.20,'Tigger must stay grounded after landing');
 if(previousTigerPosition&&t<=46)assert(tiger.position.distanceTo(previousTigerPosition)<=.25,'Tigger route must not dash between frames');
 previousTigerPosition=tiger.position.clone();
 if(t>=41&&t<=44.3+1e-6){
  const paw=transformPoint(story.root.getObjectByName('Tigger-front-paw-near').world,new Vec3());
  assert(paw.distanceTo(story.kite.position)<.6,'rescued kite must remain close to the paw');
 }
}
console.log('Kite rescue: causal timeline, failed attempts, rescue, launch, finite transforms, ending and replay passed.');
