import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createStory,STORY_DURATION} from '../src/animation/story.js';
import {Vec3,transformPoint} from '../src/core/webgl.js';
const story=createStory();
assert.equal(STORY_DURATION,68);
assert.equal(story.characters.length,3);
assert.equal(story.update(12).phase,'stuck');
assert.equal(story.update(18).phase,'piglet');
assert.equal(story.update(35).phase,'pull');
assert.equal(story.update(51).phase,'fall');
assert.equal(story.update(65).phase,'honey');
assert.equal(story.update(20).caption,'');
story.update(53);
assert(transformPoint(story.characters[1].parts.head.world,new Vec3()).distanceTo(transformPoint(story.characters[2].parts.head.world,new Vec3()))>1,'fallen heads need room instead of overlapping');
assert(story.set.getObjectByName('Door-lintel'));
assert(story.set.getObjectByName('Honey-outside'));
let prev=null,scales=[],tilt=0;
for(let f=0;f<=2040;f++){
 const t=f/30,state=story.update(t);assert.equal(state.ended,t>=68);
 story.root.traverse(n=>assert([...n.world].every(Number.isFinite)));
 assert(story.view.target.every(Number.isFinite));
 if(prev)for(let i=0;i<3;i++)assert(story.characters[i].root.position.distanceTo(prev[i])<.45,'positions and staged falls must be continuous');
 prev=story.characters.map(c=>c.root.position.clone());
 if(t>=11&&t<48)assert(story.characters[0].root.position.x< -1.7,'Pooh remains caught until the release');
 if(t>=31&&t<47){
  assert(state.pigletGripError<.16,'Piglet keeps hold of Pooh');
  assert(state.tiggerGripError<.2,'Tigger keeps hold of Piglet');
 }
 scales.push(story.characters[2].root.scale.y);tilt=Math.max(tilt,Math.abs(story.characters[2].root.axisAngle));
 if(f%30===0)for(const c of story.characters){
  let low=Infinity;c.root.traverse(m=>{if(!m.geometry)return;const p=m.geometry.positions,w=m.world;for(let j=0;j<p.length;j+=3)low=Math.min(low,w[1]*p[j]+w[5]*p[j+1]+w[9]*p[j+2]+w[13]);});
  assert(low>=-2.27,'body and feet stay above the floor');
 }
}
assert(Math.max(...scales)-Math.min(...scales)>.04,'preparation shows scaling');assert(tilt>.1);
function pose(t){story.update(t);const h=createHash('sha256');story.root.traverse(n=>h.update(JSON.stringify([...n.world])));return h.digest('hex');}
const expected=pose(50.7);pose(3);assert.equal(pose(50.7),expected);assert.equal(pose(100),pose(68));assert.equal(pose(-1),pose(0));
console.log('Door story: 68 seconds, grip contacts, stuck/release timing, staged falls, grounding, finite geometry and deterministic seeking passed.');
