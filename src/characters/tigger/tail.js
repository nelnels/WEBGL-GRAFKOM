import {Node,Mesh,Vec3,tubeGeometry} from '../../core/webgl.js';
import {BezierCurve} from '../../geometry/bezier.js';

// [TIGGER - 3D CURVE] Bezier
function createTailPath(points) {
  const curves=points.slice(0,-1).map((start,i)=>{
    const previous=points[Math.max(0,i-1)];
    const end=points[i+1];
    const next=points[Math.min(points.length-1,i+2)];
    // TITIK KONTROL TENGAH: 
    const handleOut=end.clone().sub(previous).multiplyScalar(1/6).add(start);
    const handleIn=end.clone().sub(next.clone().sub(start).multiplyScalar(1/6));
    // SATU RUAS BÉZIER 4 titik
    return new BezierCurve([start,handleOut,handleIn,end]);
  });
  return {
    getPoint(t){
      const progress=Math.max(0,Math.min(1,t))*curves.length;
      const index=Math.min(curves.length-1,Math.floor(progress));
      return curves[index].getPoint(progress-index);
    }
  };
}
export function buildTail(parent,helpers,materials) {
  const body=parent;
  const {ELLIPSOID,SOURCE}=helpers;
  const {orange,ink}=materials;
  // [TIGGER - HIERARCHICAL TRANSFORMATION] Body → Tail → tube dan ujung ellipsoid.
  const tail=new Node(); tail.name='Tigger-tail'; tail.position.set(-1.15,.40,-.09); body.add(tail);
  // Tujuh titik lokal membentuk enam ruas dari pangkal hingga ujung ekor.
  const path=createTailPath([
    new Vec3(0,0,0),new Vec3(-.45,.45,-.08),new Vec3(-1.04,.56,-.05),
    new Vec3(-1.55,.16,.02),new Vec3(-1.91,-.20,.06),new Vec3(-2.12,.02,.10),new Vec3(-2.04,.45,.10)
  ]);
  const segments=112,radial=12;
  // VOLUME
  const tailGeometry=tubeGeometry(path,segments,.16,radial); tailGeometry.clearGroups();
  tailGeometry.parameters.curve='bezier';
  for(let i=0;i<segments;i++) tailGeometry.addGroup(i*radial*6,radial*6,i>=segments-13||Math.floor(i/7)%2===1?1:0);
  const tailMesh=new Mesh(tailGeometry,[orange,ink]); tailMesh.name='Tigger-curve-ekor'; tailMesh.castShadow=true; tail.add(tailMesh);
  ELLIPSOID(tail,'ujung-ekor',path.getPoint(1).toArray(),[.18,.21,.18],ink);
  SOURCE(tail,import.meta.url);
  return tail;
}
