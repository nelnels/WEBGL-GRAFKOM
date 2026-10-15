import {Node,Mesh,material,diskGeometry,sphereGeometry} from './webgl.js';
import {egg,tube} from './primitives.js';
export function createEnvironment(){
  const root=new Node('Environment');
  const grass=material({color:0x73af50}),bark=material({color:0x80502d}),leaf=material({color:0x4d973f}),light=material({color:0x81bb55});
  const rock=material({color:0x899982}),white=material({color:0xffffff});
  const floor=new Mesh(diskGeometry(13,96),grass);floor.rotation.x=-Math.PI/2;floor.position.y=-2.25;floor.castShadow=false;root.add(floor);
  function tree(x,z,scale){
    const node=new Node();node.position.set(x,-2.24,z);node.scale.setScalar(scale);root.add(node);
    tube(node,[0,1.05,0],.20,2.1,bark);
    egg(node,[0,2.32,0],[1.03,1.20,.70],leaf);egg(node,[-.58,2.20,.05],[.68,.8,.57],light);egg(node,[.62,2.16,.04],[.70,.82,.58],leaf);
  }
  tree(-4.2,-3.6,1.1);tree(4.2,-4.2,1.3);tree(-6,-7,.85);tree(5.9,-7,.9);
  for(const [x,z,s]of [[-3,-.7,.28],[3.2,-1.3,.3],[-4.6,-2.5,.24],[4.8,-2.8,.3]]){
    const mesh=new Mesh(sphereGeometry(s,7,4),rock);mesh.position.set(x,-2.08,z);mesh.scale.y=.60;root.add(mesh);
  }
  for(const [x,z,color]of [[-2.7,-.6,0xf6d45a],[2.8,-.7,0xff82a0],[-3.7,-2.4,0xab89ec],[3.7,-2.3,0xf2d45b]]){
    const group=new Node();group.position.set(x,-2.2,z);root.add(group);tube(group,[0,.2,0],.025,.40,leaf);
    const petal=material({color});
    for(let i=0;i<5;i++){const a=i*Math.PI*.4;egg(group,[Math.cos(a)*.10,.43,Math.sin(a)*.05],[.10,.05,.045],petal);}
    egg(group,[0,.45,.02],[.045,.045,.04],material({color:0xf3be30}));
  }
  for(const [x,y,z,s]of [[-4.4,4.2,-6,.8],[4,4.0,-7,.7]]){
    const cloud=new Node();cloud.position.set(x,y,z);cloud.scale.setScalar(s);root.add(cloud);
    for(const [p,size]of [[[-.42,0,0],[.56,.34,.25]],[[0,.12,0],[.65,.46,.30]],[[.52,0,0],[.48,.30,.23]]]){
      const mesh=egg(cloud,p,size,white);mesh.castShadow=false;
    }
  }
  return root;
}
