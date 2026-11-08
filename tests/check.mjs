import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Node,Vec3,rotationAxis,multiply,translation,scaling,transformPoint,normalMatrix,identity} from '../src/core/webgl.js';
import * as primitives from '../src/geometry/primitives.js';
import {createPooh} from '../src/characters/pooh/index.js';
import {createPiglet} from '../src/characters/piglet/index.js';
import {createTigger} from '../src/characters/tigger/index.js';
import {createCharacterTransforms,createDemoControls,ARBITRARY_AXIS} from '../src/animation/character-transforms.js';

const near=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const rotated=transformPoint(rotationAxis(new Vec3(0,0,1),Math.PI/2),new Vec3(1,0,0));
near(rotated.x,0);near(rotated.y,1);
const axis=ARBITRARY_AXIS.clone();
const stable=transformPoint(rotationAxis(axis,.8),axis);near(stable.distanceTo(axis),0);
const composed=multiply(translation(2,3,4),scaling(2,3,4));
const point=transformPoint(composed,new Vec3(1,1,1));assert.deepEqual(point.toArray(),[4,6,8]);
const n=normalMatrix(scaling(2,3,4));near(n[0],.5);near(n[4],1/3);near(n[8],.25);
const p=new Node(),c=new Node();p.position.x=2;c.position.y=3;p.add(c);p.updateWorld();
assert.deepEqual(transformPoint(c.world,new Vec3()).toArray(),[2,3,0]);

for(const [id,build,position]of [['Pooh',createPooh,[0,0,0]],['Piglet',createPiglet,[0,-.55,0]],['Tigger',createTigger,[.35,.25,0]]]){
  const character=build(primitives);character.root.position.set(...position);
  let curves=0,cylinders=0,ellipsoids=0,quadrics=0,vertices=0;
  character.root.traverse(o=>{
    if(!o.geometry)return;
    const g=o.geometry;vertices+=g.positions.length/3;
    assert([...g.positions,...g.normals].every(Number.isFinite));
    assert(g.indices.every(i=>i<g.positions.length/3));
    assert(g.indices.length%3===0);
    if(g.type==='curve')curves++;
    if(g.type==='ellipsoid')ellipsoids++;
    if(g.type==='cylinder'){cylinders++;assert(g.parameters.radiusTop===g.parameters.radiusBottom);}
    if(o.name.includes('paraboloid')){
      quadrics++;
      assert.equal(g.type,'elliptic-paraboloid');
      assert(g.parameters,'paraboloid must carry equation parameters');
      const {a,b,depth:d,cy}=g.parameters;
      assert([a,b,d,cy].every(Number.isFinite)&&a>0&&b>0);
      for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3);near(z,d*(1-(x/a)**2-((y-cy)/b)**2));}
    }
    for(const group of g.groups)assert(group.start+group.count<=g.indices.length);
  });
  assert(curves>0&&cylinders>0&&ellipsoids>0&&quadrics>0);
  assert(character.body.parent===character.root);
  for(const mode of [null,'translate','rotate','scale','axis','hierarchy']){
    character.root.position.set(...position);character.root.scale.setScalar(1);character.root.rotation.set(0,0,0);character.root.axisAngle=0;
    const motion=createCharacterTransforms(character),samples=[];
    assert(motion.groundSamples.reduce((n,s)=>n+s.points.length/3,0)<=3000,'ground sampling budget');
    for(let frame=0;frame<180;frame++){
      const t=frame/60;character.update(t);motion.update(t,1/60,mode,t);character.root.updateWorld();
      character.root.traverse(o=>assert([...o.world].every(Number.isFinite)));
      if((mode==='axis'||mode==='hierarchy')&&frame%12===0){
        let lowest=Infinity;
        character.root.traverse(mesh=>{
          if(!mesh.geometry)return;const p=mesh.geometry.positions,m=mesh.world;
          for(let j=0;j<p.length;j+=3)lowest=Math.min(lowest,m[1]*p[j]+m[5]*p[j+1]+m[9]*p[j+2]+m[13]);
        });
        assert(lowest>=-2.27,'sampled grounding must keep actual vertices above ground');
      }
      samples.push([character.root.position.y,character.root.scale.x,character.root.rotation.y,character.root.axisAngle,character.body.rotation.z]);
    }
    const col={translate:0,scale:1,rotate:2,axis:3,hierarchy:4}[mode];
    if(mode){const range=samples.map(s=>s[col]);assert(Math.max(...range)-Math.min(...range)>.08,mode+' does not animate');}
  }
  console.log(`${id}: ${vertices} vertices, ${curves} curves, ${cylinders} cylinders, ${ellipsoids} ellipsoids, ${quadrics} paraboloids; all transforms passed.`);
}
const target=new EventTarget(),navigations=[];
const controls=createDemoControls(target,index=>navigations.push(index));
function press(code){const e=new Event('keydown',{cancelable:true});Object.defineProperty(e,'code',{value:code});target.dispatchEvent(e);}
for(const code of ['Digit1','Digit2','Digit3'])press(code);
assert.deepEqual(navigations,[0,1,2]);
for(const [key,mode]of Object.entries({KeyT:'translate',KeyR:'rotate',KeyS:'scale',KeyA:'axis',KeyH:'hierarchy'})){
  press(key);assert.equal(controls.state.mode,mode);controls.update(0);assert.equal(controls.update(1),1);press(key);assert.equal(controls.state.mode,null);
}
press('Space');assert(controls.state.paused);press('Space');assert(!controls.state.paused);press('KeyA');press('Escape');assert.equal(controls.state.mode,null);controls.dispose();
for(const page of ['index.html','pooh.html','piglet.html','tigger.html']){
  const html=fs.readFileSync(new URL('../'+page,import.meta.url),'utf8');
  assert((html.match(/<canvas/g)||[]).length===1);assert(!html.includes('importmap'));
}
console.log('Native matrix math, hierarchical matrices, geometry equations, 15 demos, page navigation, and pause/reset controls passed.');
