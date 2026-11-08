/*
 * Perakitan Tigger: root → badan → kepala/telinga, lengan, kaki, ekor.
 * Geometri dibangun oleh modul bagian; update(t) mempertahankan pose deterministik.
 * Transformasi hierarki: M_dunia_anak=M_dunia_parent*M_lokal_anak.
 */
import {Node,Mesh,material,parametric} from '../../core/webgl.js';
import * as quadrics from '../../geometry/quadrics.js';
import {buildMaterials} from './materials.js';
import {buildTorso} from './torso.js';
import {buildHead} from './head.js';
import {buildLimbs} from './limbs.js';
import {buildTail} from './tail.js';
const TAU=Math.PI*2;
const mix=(a,b,u)=>a+(b-a)*u;
const clamp01=x=>Math.max(0,Math.min(1,x));
export function createTigger(primitives) {
  const materials=buildMaterials(null,{material},{black:primitives.black});
  const {orange,ink}=materials;
  const helpers={TAU,mix,clamp01,
    ELLIPSOID:(...args)=>quadrics.ELLIPSOID(...args,primitives),
    ELLIPTIC_PARABOLOID:(...args)=>quadrics.ELLIPTIC_PARABOLOID(...args,primitives),
    CYLINDER:(parent,part,a,b,radius)=>quadrics.CYLINDER(parent,part,a,b,radius,orange,primitives),
    CURVE:(...args)=>quadrics.CURVE(...args,primitives),
    SOURCE:(parent,url)=>{
      const file=new URL(url).pathname.split('/').pop();
      parent.traverse(mesh=>{if(mesh.geometry&&!mesh.sourceFile)mesh.sourceFile=file;});
    }
  };
  // Permukaan bebas (non-quadric): badan, perut, belang.
  const SURFACE=(parent,part,fn,slices,stacks,mat)=>{
    const mesh=new Mesh(parametric(fn,slices,stacks),mat); mesh.name=`Tigger-surface-${part}`; parent.add(mesh); return mesh;
  };
  helpers.SURFACE=SURFACE;
  // Belang runcing: s = sepanjang belang (0..1), c = lebar (-1..1, mengecil ke ujung).
  helpers.STRIPE=(parent,part,surface)=>SURFACE(parent,part,(u,v,p)=>surface(u,(v-.5)*2*Math.pow(1-u,.8),p),28,8,ink);
  // Titik pada ellipsoid satuan (dipakai tempelan belang di mesh ellipsoid): theta dari atas, azimuth dari +z.
  helpers.onUnit=(theta,azimuth,p,r=1.012)=>p.set(r*Math.sin(theta)*Math.sin(azimuth),r*Math.cos(theta),r*Math.sin(theta)*Math.cos(azimuth));
  // Cincin belang pada ellipsoid: lintang (theta) dan busur azimuth.
  helpers.ELLIPSOID_BAND=(mesh,part,theta,arc,thickness)=>SURFACE(mesh,part,(u,v,p)=>{
    helpers.onUnit(theta-(v-.5)*thickness*Math.sin(Math.PI*u),mix(arc[0],arc[1],u),p,1.018);
  },28,8,ink);
  const root=new Node(); root.name='Tigger';
  const body=new Node(); body.name='Tigger-body'; root.add(body);
  buildTorso(body,helpers,materials);
  const head=buildHead(body,helpers,materials);
  const {arms,elbows,legs,knees}=buildLimbs(body,helpers,materials);
  const tail=buildTail(body,helpers,materials);
  return {
    root,
    body,
    parts:{head,arms,legs},
    view: {target:[-.35,.5,0],height:6.2,halfWidth:3.5},
    update(t) {
      const phase=t*2.3,lift=Math.max(0,Math.sin(phase)),swing=Math.sin(phase+.4);
      body.position.set(-lift*.08,.22+lift*.64,0);
      body.rotation.set(0,.06,-.025+Math.sin(phase)*.025);
      head.rotation.set(0,-.18+Math.sin(t*.8)*.05,-.13);
      arms[0].rotation.z=-.08+swing*.13+lift*.42; arms[1].rotation.z=.10-swing*.13+lift*.26;
      elbows[0].rotation.z=-.10-lift*.40; elbows[1].rotation.z=.10-lift*.32;
      legs[0].rotation.z=-.08-lift*.46; legs[1].rotation.z=.12-lift*.30;
      knees[0].rotation.z=.18+lift*.48; knees[1].rotation.z=-.12+lift*.40;
      tail.rotation.y=Math.sin(phase-.6)*.13;
      tail.rotation.z=Math.sin(phase-.8)*.10;
    }
  };
}
