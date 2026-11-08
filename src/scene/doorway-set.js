import {Node,Mesh,material,geometry,diskGeometry,cylinderGeometry,torusGeometry,sphereGeometry} from '../core/webgl.js';
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
 buildGround(root,{grass,sand});
 buildHouse(root,{wall,wood,roof});
 const pot=createHoneyPot('Honey-inside');root.add(pot);
 const outsidePot=createHoneyPot('Honey-outside');outsidePot.position.set(.9,FLOOR,-.85);root.add(outsidePot);
 buildTrees(root);
 // Elemen langit dan taman berada di belakang serta tepi jalur adegan.
 const sphere=sphereGeometry(1,20,14);
 const ornament=(parent,name,p,s,color)=>{
  const mesh=new Mesh(sphere,material({color}));mesh.name=name;
  mesh.position.set(...p);mesh.scale.set(...s);mesh.castShadow=false;parent.add(mesh);return mesh;
 };
 buildSky(root,ornament);
 buildGarden(root,ornament);
 root.update=()=>{};
 return {root,pot,outsidePot};
}

// Tanah dan jalur: disk serta balok.
export function buildGround(root,{grass,sand}){
 const ground=new Mesh(diskGeometry(35,64),grass);ground.rotation.x=-Math.PI/2;ground.position.y=FLOOR-.02;ground.castShadow=false;root.add(ground);
 const path=block(root,[1,FLOOR-.025,0],[13,.04,2.7],sand);path.castShadow=false;
}

// Rumah: dinding, jendela, kaca transparan, atap, cerobong, dan bangku.
export function buildHouse(root,{wall,wood,roof}){
 // Dinding depan menyisakan bukaan pintu berukuran 1.6 × 3.4.
 block(root,[DOOR_X,-.3,-1.7],[.18,3.9,1.8],wall).name='Door-wall-far';
 // Dinding dibagi mengelilingi jendela, tanpa mengubah ruang kosong pintu.
 block(root,[DOOR_X,-1.6,1.7],[.18,1.3,1.8],wall).name='Door-wall-near';
 block(root,[DOOR_X,1.05,1.7],[.18,1.2,1.8],wall);
 for(const z of [.975,2.425])block(root,[DOOR_X,-.25,z],[.18,1.4,.35],wall);
 block(root,[DOOR_X,1.4,0],[.18,.5,1.6],wall).name='Door-lintel';
 for(const z of [-.84,.84])block(root,[DOOR_X+.02,-.55,z],[.25,3.4,.1],wood);
 block(root,[DOOR_X+.02,1.15,0],[.25,.12,1.8],wood);
 block(root,[-4.45,FLOOR-.025,0],[4.8,.04,5.3],material({color:0xc3a77d}));
 block(root,[-4.4,-.3,-2.6],[4.8,3.9,.15],wall);
 // Dinding belakang menutup rumah; panel kaca menjaga interior tetap terlihat.
 block(root,[-6.8,-.3,0],[.18,3.9,5.3],wall).name='House-back-wall';
 // Dinding rendah menjadi alas panel kaca sisi kamera.
 block(root,[-4.4,-1.97,2.6],[4.8,.55,.15],wall);
 // Satu panel kaca penuh menutup sisi terbuka dan tetap memperlihatkan interior.
 const windowMaterial=material({color:0xb1dce6,roughness:.18});windowMaterial.opacity=.16;
 const fullGlass=new Mesh(geometry(
  [-6.8,-1.695,2.62,-2,-1.695,2.62,-2,1.65,2.62,-6.8,1.65,2.62],
  [0,0,1,0,0,1,0,0,1,0,0,1],[0,1,2,0,2,3]),windowMaterial);
 fullGlass.name='House-full-glass';fullGlass.castShadow=false;fullGlass.receiveShadow=false;root.add(fullGlass);
 for(const x of [-6.8,-2])block(root,[x,-.0225,2.64],[.08,3.345,.08],wood);
 block(root,[-4.4,1.65,2.64],[4.8,.08,.08],wood);
 // Dua bidang atap bertemu di bubungan di atas dinding dan panel kaca.
 for(const side of [-1,1]){
  const panel=block(root,[-4.4,2.15,side*1.4],[5.1,.18,2.95],roof);panel.rotation.x=side*.28;
  const fascia=block(root,[-1.82,2.12,side*1.4],[.12,.22,2.95],wood);fascia.rotation.x=side*.28;
 }
 block(root,[-4.4,2.57,0],[5.25,.15,.16],wood);
 for(const z of [-2.82,2.82])block(root,[-4.4,1.75,z],[5.25,.2,.15],wood);
 const glass=material({color:0x91bdca,roughness:.25});
 block(root,[-1.895,-.25,1.7],[.035,1.35,1.08],glass).name='House-window';
 for(const z of [1.12,2.28])block(root,[-1.84,-.25,z],[.15,1.56,.1],wood);
 for(const y of [-.99,.49])block(root,[-1.84,y,1.7],[.15,.1,1.26],wood);
 block(root,[-1.80,-.25,1.7],[.12,1.4,.055],wood);
 block(root,[-1.80,-.25,1.7],[.12,.055,1.16],wood);
 block(root,[-1.73,-1.06,1.7],[.48,.12,1.4],wood).name='Window-sill';
 for(const z of [1.12,2.28])block(root,[-2.13,-.25,z],[.12,1.56,.1],wood);
 for(const y of [-.99,.49])block(root,[-2.13,y,1.7],[.12,.1,1.26],wood);
 block(root,[-2.13,-.25,1.7],[.12,1.4,.055],wood);
 block(root,[-2.13,-.25,1.7],[.12,.055,1.16],wood);
 // Cerobong dan balok sudut memberi rumah siluet yang lebih terbaca.
 const brick=material({color:0xa16d50});
 block(root,[-5.7,2.7,-1.2],[.55,.6,.6],brick).name='House-chimney';
 block(root,[-5.7,3.05,-1.2],[.7,.16,.75],wood);
 for(const z of [-2.52,2.52])block(root,[-1.88,-.3,z],[.16,3.9,.13],wood);
 for(const x of [-6.6,-2.3])block(root,[x,1.55,0],[.15,.26,5.3],wood);
 const stool=block(root,[-4.8,-1.92,1.65],[1.05,.65,.85],wood);stool.name='Honey-stool';
}

// Pohon: batang cylinder dan tajuk ellipsoid.
export function buildTrees(root){
 const leaves=material({color:0x607e4f}),trunk=material({color:0x79563a});
 for(const [x,z,s]of [
  [-8,-5,1],[0,-7,1.1],[6,-6,.85],
  [-11,-9,1.25],[-5,-11,.95],[3,-12,1.2],[10,-10,1.1],
  [-14,-3,.9],[13,-3,.85]
 ]){
  const tree=new Node('Yard-tree');tree.position.set(x,FLOOR,z);root.add(tree);
  const stem=new Mesh(cylinderGeometry(.18,.28,3*s,12),trunk);stem.position.y=1.5*s;tree.add(stem);
  for(const side of [-1,1]){
   const crown=new Mesh(sphereGeometry(1,20,14),leaves);crown.position.set(side*.45*s,3.1*s,0);crown.scale.set(1.1*s,1.3*s,.9*s);tree.add(crown);
  }
 }
}

// Langit: matahari dan kelompok awan ellipsoid.
export function buildSky(root,ornament){
 const sun=ornament(root,'Yard-sun',[-4,4.5,-12],[.7,.7,.7],0xffda70);
 sun.receiveShadow=false;
 for(const [i,x,y,z]of [[0,-7,5,-13],[1,-1,6,-16],[2,9,4.8,-15]]){
  const cloud=new Node(`Yard-cloud-${i}`);cloud.position.set(x,y,z);root.add(cloud);
  for(const [j,dx,dy,s]of [[0,-.7,0,.65],[1,0,.18,.85],[2,.8,0,.62]]){
   const puff=ornament(cloud,`Cloud-puff-${j}`,[dx,dy,0],[s,s*.45,s*.6],0xfff4dd);puff.receiveShadow=false;
  }
 }
}

// Taman: semak, kelopak, dan pusat bunga ellipsoid.
export function buildGarden(root,ornament){
 for(const [i,x,z]of [[0,-7,-3.8],[1,-3,-4],[2,1,-4.4],[3,4.7,-3.8],[4,8,-3],[5,-7,4],[6,6,4]]){
  const bush=new Node(`Yard-garden-${i}`);bush.position.set(x,FLOOR,z);root.add(bush);
  for(const side of [-1,0,1])ornament(bush,'Garden-leaf',[side*.35,.26+(.12*(side===0)),0],[.45,.34,.38],side===0?0x779951:0x688c50);
  for(let j=0;j<3;j++){
   const x=(j-1)*.32,y=.5+(j%2)*.12;
   for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ornament(bush,'Garden-petal',[x+Math.cos(a)*.08,y+Math.sin(a)*.08,.30],[.065,.065,.035],i%2?0xe8a3a6:0xffe5a0);}
   ornament(bush,'Garden-flower-center',[x,y,.34],[.045,.045,.03],0xe6ad36);
  }
 }
}
