import {Mesh,geometry} from '../core/webgl.js';


// Balok penyusun set rumah; seluruh geometri dibuat secara prosedural.
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
