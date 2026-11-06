import {Node,Mesh,Vec3,material,geometry,cylinderGeometry,alignY} from '../core/webgl.js';
import {line,egg} from '../geometry/primitives.js';

// Small reusable solid props; all geometry is generated locally.
export function block(parent,p,size,mat){
  const [x,y,z]=size.map(v=>v/2),vertices=[],normals=[],indices=[];
  for(const [n,face]of [
    [[0,0,1],[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]]],
    [[0,0,-1],[[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]]],
    [[1,0,0],[[x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z]]],
    [[-1,0,0],[[-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z]]],
    [[0,1,0],[[-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z]]],
    [[0,-1,0],[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z]]]
  ]){const start=vertices.length/3;for(const v of face){vertices.push(...v);normals.push(...n);}indices.push(start,start+1,start+2,start,start+2,start+3);}
  const mesh=new Mesh(geometry(vertices,normals,indices),mat);mesh.position.set(...p);parent.add(mesh);return mesh;
}

export function createKite(){
  const root=new Node('Piglet-kite');
  const red=material({color:0xd96343}),cream=material({color:0xf8d573}),ink=material({color:0x745140});
  const points=[[0,1,0],[-.65,0,0],[0,-.8,0],[.65,0,0],[0,0,.09]];
  for(let i=0;i<4;i++){
    const a=points[i],b=points[(i+1)%4],c=points[4];
    const mesh=new Mesh(geometry([...a,...b,...c],[0,0,1,0,0,1,0,0,1],[0,1,2]),i%2?red:cream);root.add(mesh);
  }
  line(root,[[0,1,.025],[0,0,.11],[0,-.8,.025]],.018,ink);
  line(root,[[-.65,0,.025],[0,0,.11],[.65,0,.025]],.018,ink);
  const tail=new Node('Kite-tail');root.add(tail);
  line(tail,[[0,-.8,0],[-.25,-1.25,0],[.16,-1.65,.05],[-.2,-2.1,.08]],.012,ink);
  for(const [x,y]of [[-.19,-1.13],[.1,-1.6],[-.17,-2.03]]){
    const bow=block(tail,[x,y,.04],[.28,.10,.035],red);bow.rotation.z=.3;
  }
  return {root,tail};
}

export function createKiteString(parent){
  const mat=material({color:0xe4d6ae}),g=cylinderGeometry(.009,.009,1,6);
  const segments=Array.from({length:14},()=>{const mesh=new Mesh(g,mat);mesh.castShadow=false;parent.add(mesh);return mesh;});
  return (start,end,sag=.3)=>{
    let previous=start;
    for(let i=0;i<segments.length;i++){
      const u=(i+1)/segments.length;
      const next=start.clone().multiplyScalar(1-u).add(end.clone().multiplyScalar(u));
      next.y-=Math.sin(Math.PI*u)*Math.min(sag,start.distanceTo(end)*.4);
      const direction=next.clone().sub(previous),mesh=segments[i];
      mesh.position.copy(previous).add(next).multiplyScalar(.5);mesh.scale.y=Math.max(.0001,direction.length());mesh.orientation=alignY(direction);previous=next;
    }
  };
}
