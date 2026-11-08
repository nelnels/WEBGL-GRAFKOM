import {Node,Mesh,material,diskGeometry,cylinderGeometry,torusGeometry,sphereGeometry} from '../core/webgl.js';
import {block} from './story-props.js';

export const DOOR_X=-2;
export const DOOR_HALF_WIDTH=.8;
export const FLOOR=-2.25;
export function createHoneyPot(name){
 const root=new Node(name),clay=material({color:0xa7703d}),honey=material({color:0xe7ae35,roughness:.3});
 const body=new Mesh(cylinderGeometry(.29,.25,.6,28),clay);body.position.y=.3;root.add(body);
 const lip=new Mesh(torusGeometry(.29,.045,8,32),clay);lip.rotation.x=Math.PI/2;lip.position.y=.61;root.add(lip);
 const top=new Mesh(diskGeometry(.26,28),honey);top.rotation.x=-Math.PI/2;top.position.y=.605;root.add(top);
 const band=new Mesh(torusGeometry(.285,.025,8,32),honey);band.rotation.x=Math.PI/2;band.position.y=.4;root.add(band);
 return root;
}
export function createDoorwaySet(){
 const root=new Node('Simple-house-yard');
 const grass=material({color:0x829967}),sand=material({color:0xd4bb8c}),wall=material({color:0xe2cca2}),wood=material({color:0x815b3d}),roof=material({color:0x8c7150});
 const ground=new Mesh(diskGeometry(35,64),grass);ground.rotation.x=-Math.PI/2;ground.position.y=FLOOR-.02;ground.castShadow=false;root.add(ground);
 const path=block(root,[1,FLOOR-.025,0],[13,.04,2.7],sand);path.castShadow=false;
 // Front wall: two sides + lintel, leaving a real 1.6 x 3.4 doorway.
 block(root,[DOOR_X,-.3,-1.7],[.18,3.9,1.8],wall).name='Door-wall-far';
 block(root,[DOOR_X,-.3,1.7],[.18,3.9,1.8],wall).name='Door-wall-near';
 block(root,[DOOR_X,1.4,0],[.18,.5,1.6],wall).name='Door-lintel';
 for(const z of [-.84,.84])block(root,[DOOR_X+.02,-.55,z],[.25,3.4,.1],wood);
 block(root,[DOOR_X+.02,1.15,0],[.25,.12,1.8],wood);
 block(root,[-4.45,FLOOR-.025,0],[4.8,.04,5.3],material({color:0xc3a77d}));
 block(root,[-4.4,-.3,-2.6],[4.8,3.9,.15],wall);
 // The near wall is low and the back is open: a simple cutaway for the opening shot.
 block(root,[-4.4,-1.97,2.6],[4.8,.55,.15],wall);
 block(root,[-4.4,1.78,0],[5.1,.18,5.6],roof);
 for(const x of [-6.6,-2.3])block(root,[x,1.55,0],[.15,.26,5.3],wood);
 const stool=block(root,[-4.8,-1.92,1.65],[1.05,.65,.85],wood);stool.name='Honey-stool';
 const pot=createHoneyPot('Honey-inside');root.add(pot);
 const outsidePot=createHoneyPot('Honey-outside');outsidePot.position.set(.9,FLOOR,-.85);root.add(outsidePot);
 const leaves=material({color:0x607e4f}),trunk=material({color:0x79563a});
 for(const [x,z,s]of [[-8,-5,1],[0,-7,1.1],[6,-6,.85]]){
  const tree=new Node('Yard-tree');tree.position.set(x,FLOOR,z);root.add(tree);
  const stem=new Mesh(cylinderGeometry(.18,.28,3*s,12),trunk);stem.position.y=1.5*s;tree.add(stem);
  for(const side of [-1,1]){
   const crown=new Mesh(sphereGeometry(1,20,14),leaves);crown.position.set(side*.45*s,3.1*s,0);crown.scale.set(1.1*s,1.3*s,.9*s);tree.add(crown);
  }
 }
 root.update=()=>{};
 return {root,pot,outsidePot};
}
