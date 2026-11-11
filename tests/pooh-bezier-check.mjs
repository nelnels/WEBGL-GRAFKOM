import assert from 'node:assert/strict';
import {createPooh} from '../src/characters/pooh/index.js';
import {createPiglet} from '../src/characters/piglet/index.js';
import {createTigger} from '../src/characters/tigger/index.js';
import * as primitives from '../src/geometry/primitives.js';
import {Vec3} from '../src/core/webgl.js';

const pooh=createPooh(),curves=[];
pooh.root.traverse(m=>{if(m.geometry?.type==='curve')curves.push(m);});
assert.equal(curves.length,5,'Pooh keeps its two arms, two eyebrows and smile');
assert(curves.every(m=>m.geometry.parameters.curve==='bezier'),'All five Pooh curves must use Bezier evaluation');
const {BezierCurve}=await import('../src/geometry/bezier.js');
const control=[new Vec3(0,0,0),new Vec3(1,2,1),new Vec3(2,0,0)],curve=new BezierCurve(control);
assert.deepEqual(curve.getPoint(0).toArray(),[0,0,0]);
assert.deepEqual(curve.getPoint(1).toArray(),[2,0,0]);
assert.deepEqual(curve.getPoint(.5).toArray(),[1,1,.5],'Bezier midpoint is weighted by the control point, not interpolated through it');
assert.deepEqual(control[1].toArray(),[1,2,1],'Evaluation must not mutate the control points');
for(const m of curves){
  assert([...m.geometry.positions,...m.geometry.normals].every(Number.isFinite),'Bezier tubes need finite vertices and normals');
}
const piglet=createPiglet(),pigletCurves=[];
piglet.root.traverse(m=>{if(m.geometry?.type==='curve')pigletCurves.push(m);});
assert.equal(pigletCurves.length,5,'Piglet keeps two eyebrows, a smile and two ear folds');
assert(pigletCurves.every(m=>m.geometry.parameters.curve==='bezier'),'Piglet face and ear curves use Bezier evaluation');
const tigger=createTigger(primitives);
const tail=tigger.root.getObjectByName('Tigger-curve-ekor');
assert.equal(tail.geometry.parameters.curve,'bezier');
tigger.parts.head.traverse(m=>{
  if(m.geometry?.type==='curve')assert.notEqual(m.geometry.parameters.curve,'bezier');
});
console.log('Bezier: Pooh and Piglet curves, Tigger tail, endpoints and control point evaluation passed.');
