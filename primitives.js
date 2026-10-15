import { Node,Mesh,Vec3,material,sphereGeometry,cylinderGeometry,CatmullRomCurve,tubeGeometry,alignY,parametric } from './webgl.js';

export const black=material({color:0x171212,roughness:.65});
const brown=material({color:0x49251c});
const unitSphere=sphereGeometry();
export function egg(parent,p,s,mat){
  const mesh=new Mesh(unitSphere,mat);mesh.position.set(...p);mesh.scale.set(...s);parent.add(mesh);return mesh;
}
export function tube(parent,p,r,height,mat,rotation=[0,0,0]){
  const mesh=new Mesh(cylinderGeometry(r,r,height,32),mat);mesh.position.set(...p);mesh.rotation.set(...rotation);parent.add(mesh);return mesh;
}
export function armSegment(parent,a,b,radius,mat){
  const start=new Vec3(...a),end=new Vec3(...b),direction=end.clone().sub(start);
  const mesh=tube(parent,start.clone().add(end).multiplyScalar(.5).toArray(),radius,direction.length(),mat);
  mesh.orientation=alignY(direction);return mesh;
}
export function line(parent,points,radius=.043,mat=brown){
  const curve=new CatmullRomCurve(points.map(p=>new Vec3(...p)));
  const mesh=new Mesh(tubeGeometry(curve,48,radius,10),mat);parent.add(mesh);return mesh;
}
export function paraboloid(parent,p,a,b,depth,mat,name='elliptic-paraboloid'){
  const g=parametric((r,v,out)=>{const angle=v*Math.PI*2;out.set(a*r*Math.cos(angle),b*r*Math.sin(angle),depth*(1-r*r));},32,48);
  g.type='elliptic-paraboloid';g.parameters={a,b,depth};
  const mesh=new Mesh(g,mat);mesh.position.set(...p);mesh.name=name;parent.add(mesh);return mesh;
}
export {Node,Mesh,Vec3,material};
