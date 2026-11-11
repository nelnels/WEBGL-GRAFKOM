import {Mesh,Vec3,tubeGeometry} from '../../core/webgl.js';
import {BezierCurve} from '../../geometry/bezier.js';
export {BezierCurve};

export function bezierLine(parent,points,radius,mat){
  const curve=new BezierCurve(points.map(p=>new Vec3(...p)));
  const geometry=tubeGeometry(curve,48,radius,10);
  geometry.parameters.curve='bezier';
  const mesh=new Mesh(geometry,mat);parent.add(mesh);return mesh;
}
