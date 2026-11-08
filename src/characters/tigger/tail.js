/*
 * Ekor: kurva Catmull-Rom 3D, diekstrusi menjadi tube beradius tetap.
 * P(t)=0.5[2P1+(-P0+P2)t+(2P0-5P1+4P2-P3)t²+(-P0+3P1-3P2+P3)t³].
 * Ujung ekor: ellipsoid, x²/a²+y²/b²+z²/c²=1.
 * Material groups mempertahankan pita hitam/oranye pada geometri tube yang sama.
 */
import {Node,Mesh,Vec3,CatmullRomCurve,tubeGeometry} from '../../core/webgl.js';
export function buildTail(parent,helpers,materials) {
  const body=parent;
  const {ELLIPSOID,SOURCE}=helpers;
  const {orange,ink}=materials;
  const tail=new Node(); tail.name='Tigger-tail'; tail.position.set(-1.15,.40,-.09); body.add(tail);
  const path=new CatmullRomCurve([
    new Vec3(0,0,0),new Vec3(-.45,.45,-.08),new Vec3(-1.04,.56,-.05),
    new Vec3(-1.55,.16,.02),new Vec3(-1.91,-.20,.06),new Vec3(-2.12,.02,.10),new Vec3(-2.04,.45,.10)
  ]);
  const segments=112,radial=12;
  const tailGeometry=tubeGeometry(path,segments,.16,radial); tailGeometry.clearGroups();
  for(let i=0;i<segments;i++) tailGeometry.addGroup(i*radial*6,radial*6,i>=segments-13||Math.floor(i/7)%2===1?1:0);
  const tailMesh=new Mesh(tailGeometry,[orange,ink]); tailMesh.name='Tigger-curve-ekor'; tailMesh.castShadow=true; tail.add(tailMesh);
  ELLIPSOID(tail,'ujung-ekor',path.getPoint(1).toArray(),[.18,.21,.18],ink);
  SOURCE(tail,import.meta.url);
  return tail;
}
