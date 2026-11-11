import {Mesh,Vec3,tubeGeometry} from '../core/webgl.js';

export class BezierCurve {
  constructor(points){this.points=points.map(p=>p.clone());}
  getPoint(t){
    const u=Math.max(0,Math.min(1,t)),work=this.points.map(p=>p.clone());
    // De Casteljau: interpolasi berulang antar-titik kontrol menghasilkan kurva Bezier.
    for(let level=work.length-1;level>0;level--){
      for(let i=0;i<level;i++)work[i].multiplyScalar(1-u).add(work[i+1].clone().multiplyScalar(u));
    }
    return work[0];
  }
}

export function bezierLine(parent,points,radius,mat){
  const curve=new BezierCurve(points.map(p=>new Vec3(...p)));
  const geometry=tubeGeometry(curve,48,radius,10);
  geometry.parameters.curve='bezier';
  const mesh=new Mesh(geometry,mat);parent.add(mesh);return mesh;
}
