import assert from 'node:assert/strict';
import * as primitives from '../src/geometry/primitives.js';
import {createPooh} from '../src/characters/pooh/index.js';
import {createStory} from '../src/animation/story.js';
import {Vec3,transformPoint} from '../src/core/webgl.js';
const pooh=createPooh(primitives);
const shirt=pooh.root.getObjectByName('Pooh-ellipsoid-baju');
assert.equal(shirt.geometry.type,'ellipsoid');
const shirtY=Array.from(shirt.geometry.positions).filter((_,i)=>i%3===1);
assert(Math.min(...shirtY)<-.99&&Math.max(...shirtY)>.99,'shirt must use a complete ellipsoid, including both poles');
const skull=pooh.root.getObjectByName('Pooh-ellipsoid-kepala'),muzzle=pooh.root.getObjectByName('Pooh-paraboloid-moncong'),nose=pooh.root.getObjectByName('Pooh-ellipsoid-hidung');
const base=muzzle.position,delta=base.clone().sub(skull.position);
assert((delta.x/skull.scale.x)**2+(delta.y/skull.scale.y)**2+(delta.z/skull.scale.z)**2<1,'muzzle base must overlap the head instead of floating in front of it');
const {a,b,depth}=muzzle.geometry.parameters;
const surface=base.z+depth*(1-((nose.position.x-base.x)/a)**2-((nose.position.y-base.y)/b)**2);
assert(nose.position.z-nose.scale.z<surface-.03,'back of nose must be buried in the muzzle');
const smile=pooh.root.getObjectByName('Pooh-smile').geometry.positions;
for(let i=0;i<smile.length;i+=3){
 const x=smile[i],y=smile[i+1],z=smile[i+2];
 const face=base.z+depth*(1-((x-base.x)/a)**2-((y-base.y)/b)**2);
 assert(y>-.52,'smile sits on the front of the muzzle instead of hanging below it');
 assert(Math.abs(z-face)<.035,'smile follows the muzzle surface without a floating gap');
}
const story=createStory();let previous=null;
for(let f=0;f<=330;f++){
 const t=f/60;story.update(t);const pot=story.set.getObjectByName('Honey-inside');
 if(t<4.5){
  const hand=transformPoint(story.characters[0].parts.arms[1].children[3].world,new Vec3()),d=hand.sub(pot.position),a=pot.rotation.z;
  const radial=Math.hypot(Math.cos(a)*d.x+Math.sin(a)*d.y,d.z);
  assert(radial>.43&&radial<.50,'paw stays against the outside of the pot, never through its centre');
  assert(Math.abs(-Math.sin(a)*d.x+Math.cos(a)*d.y-.3)<.02,'pot tilts around the same grip height');
 }
 if(previous)assert(pot.position.distanceTo(previous)<.22,'pot lift and set-down must remain smooth');
 previous=pot.position.clone();
}
for(const t of [66,67,68]){
 story.update(t);const pot=story.set.getObjectByName('Honey-outside'),hand=transformPoint(story.characters[0].parts.arms[0].children[3].world,new Vec3()),d=hand.sub(pot.position),a=pot.rotation.z;
 assert(Math.hypot(Math.cos(a)*d.x+Math.sin(a)*d.y,d.z)>.43,'closing grip must also stay outside the pot wall');
}
console.log('Pooh contacts: connected head/muzzle/nose, external pot grip and smooth lift/set-down passed.');
