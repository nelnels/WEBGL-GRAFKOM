import assert from 'node:assert/strict';
import {Vec3,transformPoint} from '../src/core/webgl.js';
import {createStory} from '../src/animation/story.js';
const story=createStory();
assert.equal(story.characters.length,3);
assert(story.kite,'the rescue must have a visible kite');
assert.equal(story.update(4).kiteState,'flying');
assert.equal(story.update(14).kiteState,'stuck');
assert.equal(story.update(28).kiteState,'stuck','first attempts cannot free the kite');
assert.equal(story.update(43).kiteState,'rescued');
story.update(41);assert(story.kite.position.distanceTo(transformPoint(story.root.getObjectByName('Tigger-front-paw-near').world,new Vec3()))<.01,'paw actually reaches kite at rescue');
assert.equal(story.update(54).kiteState,'flying','the ending must resolve the problem');
story.update(14);const snag=story.kite.position.clone();story.update(28);assert(story.kite.position.distanceTo(snag)<.15,'kite stays on branch during failed attempts');
let min=Infinity,max=-Infinity,axis=0,highest=0;
for(let frame=0;frame<=1800;frame++){
 const t=frame/30,state=story.update(t);story.root.updateWorld();assert.equal(state.ended,t>=60);
 story.root.traverse(n=>assert([...n.world].every(Number.isFinite)));
 const tiger=story.characters[2].root;min=Math.min(min,tiger.scale.y);max=Math.max(max,tiger.scale.y);axis=Math.max(axis,Math.abs(tiger.axisAngle));
 if(t>=39&&t<=43)highest=Math.max(highest,tiger.position.y);
}
assert(max-min>.08,'crouch and launch must squash/stretch');assert(axis>.1,'leap uses arbitrary axis');assert(highest>1,'rescue jump reaches the branch');
story.update(60);const end=story.characters.map(c=>c.root.position.toArray());story.update(100);assert.deepEqual(story.characters.map(c=>c.root.position.toArray()),end);
story.update(7);const first=story.kite.position.toArray();story.update(55);story.update(7);assert.deepEqual(story.kite.position.toArray(),first,'scrubbing/replay is deterministic');
console.log('Kite rescue: causal timeline, failed attempts, rescue, launch, finite transforms, ending and replay passed.');
