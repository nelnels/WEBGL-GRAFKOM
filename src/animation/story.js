import {Node,Vec3,transformPoint} from '../core/webgl.js';
import * as primitives from '../geometry/primitives.js';
import {createPooh} from '../characters/pooh/index.js';
import {createPiglet} from '../characters/piglet/index.js';
import {createTigger} from '../characters/tigger/index.js';
import {createDoorwaySet,FLOOR} from '../scene/doorway-set.js';

export const STORY_DURATION=68;
// Penanda bab untuk slider/presentasi; transisi pose tetap memakai interpolasi halus.
export const STORY_PHASES=[
 {start:0,id:'eat',label:'Pooh menikmati madu'},
 {start:10,id:'stuck',label:'Pooh terjepit di pintu'},
 {start:14,id:'piglet',label:'Piglet mencoba membantu'},
 {start:24,id:'help',label:'Tigger ikut membantu'},
 {start:30,id:'pull',label:'Dua usaha menarik bersama'},
 {start:48,id:'fall',label:'Lepas dan jatuh bergantian'},
 {start:55,id:'rise',label:'Bangun bergantian'},
 {start:63,id:'honey',label:'Pooh kembali meraih madu'}
];
const STORY_TIMING={
 firstPull:[30.5,33,35.5,38.5],secondPull:[40.5,47.8,48,48.5],
 release:[48,49.2],fall:[48.5,50.5],rise:[56,59.5]
};
function getStoryPhase(t){
 let chapter=0;
 for(let i=1;i<STORY_PHASES.length;i++)if(t>=STORY_PHASES[i].start)chapter=i;
 return {phase:STORY_PHASES[chapter].id,chapter};
}
// Interpolasi: waktu absolut → u halus → posisi/sudut, tanpa akumulasi antar-frame.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const blend=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,u)=>a+(b-a)*u;
const pulse=(t,a,b)=>blend(t,a,a+.5)*(1-blend(t,b-.5,b));
const effort=t=>{
 const [a,b,c,d]=STORY_TIMING.firstPull,[e,f,g,h]=STORY_TIMING.secondPull;
 return .7*blend(t,a,b)*(1-blend(t,c,d))+blend(t,e,f)*(1-blend(t,g,h));
};
// Titik dunia untuk dukungan lantai serta kontak tangan antar-karakter.
function lowestPoint(root){
 let low=Infinity;root.traverse(m=>{if(!m.geometry)return;const p=m.geometry.positions,w=m.world;
 for(let j=0;j<p.length;j+=3)low=Math.min(low,w[1]*p[j]+w[5]*p[j+1]+w[9]*p[j+2]+w[13]);});return low;
}
const point=(node,p=[0,0,0])=>transformPoint(node.world,new Vec3(...p));
const average=nodes=>nodes.reduce((p,n)=>p.add(point(n)),new Vec3()).multiplyScalar(1/nodes.length);
// Rotate the pot around a grip on its outer wall, not through the centre of the paw.
const heldPotPosition=(hand,angle)=>hand.clone().sub(new Vec3(-.3*Math.sin(angle),.3*Math.cos(angle),.46));

export function createStory(){
 // 1. Perakitan set, karakter, pose awal, dan referensi telapak yang dipakai cerita.
 const root=new Node('Pooh-stuck-in-the-door');
 const {root:set,pot,outsidePot}=createDoorwaySet();root.add(set);
 const characters=[createPooh(primitives),createPiglet(primitives),createTigger(primitives)],sizes=[.48,.72,.78];
 const saved=characters.map(c=>{
  root.add(c.root);const rest=[];c.root.traverse(node=>rest.push({node,position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()}));return rest;
 });
 const poohHands=characters[0].parts.arms.map(a=>a.children[3]);
 const pigHands=characters[1].parts.arms.map(a=>a.children.at(-1));
 const tigerHand=root.getObjectByName('Tigger-front-paw-near');
 const view={target:[-4.6,-.25,.3],height:5.8,halfWidth:3.5,yaw:-.35,pitch:.02};
 function pose(t){
  // 2. Reset pose sebelum menerapkan gerakan pada waktu t (seek/replay deterministik).
  const pulling=effort(t),released=blend(t,...STORY_TIMING.release);
  characters.forEach((c,i)=>{
   saved[i].forEach(r=>{r.node.position.copy(r.position);r.node.rotation.copy(r.rotation);r.node.scale.copy(r.scale);});
   const yaw=i===0?mix(-Math.PI/2,Math.PI/2,blend(t,5,6.5)):i===1?-Math.PI/2:Math.PI;
   c.root.rotation.set(0,yaw,0);c.root.scale.setScalar(sizes[i]);c.root.axis.set(1,1,.5).normalize();c.root.axisAngle=0;
   const fall=blend(t,STORY_TIMING.fall[0]+i*.45,STORY_TIMING.fall[1]+i*.45)*(1-blend(t,STORY_TIMING.rise[0]+i*.7,STORY_TIMING.rise[1]+i*.7));
   const walk=i===0?pulse(t,5,10):i===1?pulse(t,14,19):pulse(t,23,29);
   c.parts.head.rotation.set(.06,0,0);
   c.parts.legs.forEach((leg,j)=>leg.rotation.x=(j?1:-1)*Math.sin(t*6)*.19*walk);
   c.parts.arms.forEach((arm,j)=>arm.rotation.set((j?1:-1)*Math.sin(t*6)*.14*walk,0,0));
   // 3a. Pooh: makan, terjepit, menahan tarikan, lalu kembali meraih madu.
   if(i===0){
    // Menggeliat diagonal saat tersangkut, lalu kembali tegak sebelum dibantu.
    c.root.axis.set(1,.5,.25).normalize();
    c.root.axisAngle=.12*Math.sin(t*3)*pulse(t,10.5,14);
    const squeeze=.15*pulse(t,47.7,49.6);
    c.root.scale.x*=1-squeeze;c.root.scale.y*=1+squeeze*.35;
    const stuck=pulse(t,10,48),strain=pulling*.15;
    c.root.position.set(mix(-4.6,-2.08,blend(t,5.5,10))+.06*Math.sin(t*4)*pulse(t,10.5,14)+strain+released*2.2,0,0);
    c.body.rotation.x=-.06*pulling;
    const eat=pulse(t,0,4.5),sip=pulse(t,1.1,3.6);
    c.parts.arms[1].rotation.set(-1.5*eat-.18*sip,0,-.55*eat);
    c.parts.head.rotation.x=.12*eat-.14*sip+.12*stuck;
    for(const [j,arm]of c.parts.arms.entries()){
     arm.rotation.x=mix(arm.rotation.x,-1.08,blend(t,11,16)*(1-blend(t,48.8,50)));
     arm.rotation.z+=(j===0?1:-1)*.65*blend(t,11,16)*(1-blend(t,48.8,50));
    }
    c.parts.head.rotation.y=.3*Math.sin(t*2)*pulse(t,10.5,14);
    c.parts.arms[0].rotation.x-=1.2*blend(t,63,66);
    c.parts.head.rotation.x+=.3*blend(t,63,66);
   }
   // 3b. Piglet: mendekat, memegang tangan Pooh, dan menarik dengan badan/kaki.
   if(i===1){
    // Satu kemiringan singkat untuk mencari tumpuan, berbeda dari geliatan Pooh.
    c.root.axis.set(.5,1,-.5).normalize();
    c.root.axisAngle=.10*pulse(t,21,24);
    c.root.position.set(mix(2.2,-.25,blend(t,14,19))+released*2.2,0,.05);
    c.parts.head.rotation.y=.45*pulse(t,14,17);
    const grip=blend(t,19,21)*(1-blend(t,48.8,50));
    c.parts.arms.forEach((arm,j)=>arm.rotation.set(-1.7*grip,0,(j===0?.35:-.35)*grip));
    c.body.rotation.x=.24*pulling;
    c.parts.legs.forEach((leg,j)=>leg.rotation.x+=(j?-.18:.18)*pulling);
    c.parts.head.rotation.z=.13*pulse(t,21,24);
    c.parts.head.rotation.y-=.65*blend(t,64,66);
    c.parts.arms[0].rotation.z-=1.2*blend(t,65,66);
   }
   // 3c. Tigger: mendekat, membantu Piglet, merendah saat bersiap.
   if(i===2){
    c.root.position.set(mix(6,2.4,blend(t,23,29))+released*1.8,0,-.05);
    c.body.position.set(0,.22,0);c.body.rotation.z=.07*pulling;
    const grip=blend(t,28.5,30.5)*(1-blend(t,49.5,51));
    c.parts.arms.forEach(arm=>arm.rotation.z=1.3*grip);
    c.root.getObjectByName('Tigger-elbow-near').rotation.z=-.1;
    c.root.getObjectByName('Tigger-elbow-far').rotation.z=-.1;
    for(const side of ['near','far'])c.root.getObjectByName('Tigger-knee-'+side).rotation.z=.12+.15*pulling;
    c.parts.legs.forEach((leg,j)=>{leg.rotation.x=0;leg.rotation.z+=(j?1:-1)*Math.sin(t*6)*.18*walk;});
    const crouch=.075*pulse(t,29.2,31)+.07*pulse(t,39,41);
    c.root.scale.set(sizes[i]*(1+crouch*.4),sizes[i]*(1-crouch),sizes[i]*(1+crouch*.4));
    c.root.axisAngle=.11*pulse(t,34,37);
    c.parts.head.rotation.z=.15*pulse(t,24,27);
    c.parts.head.rotation.y-=.5*blend(t,64,66);
    c.parts.arms[0].rotation.z+=.8*blend(t,65,66);
    // Saat mendekat, Tigger menyeimbangkan badan pada sumbu diagonal yang terlihat jelas.
    c.root.axisAngle+=.48*pulse(t,24,27.8);
    // Sesudah menolong, menghadap penonton dan melambai bertingkat dari bahu ke telapak.
    const greeting=blend(t,60,63);
    c.root.rotation.y=mix(yaw,-.35,greeting);
    c.root.position.z-=1.2*greeting;
    const shoulder=pulse(t,61,68),elbow=pulse(t,62,68),wrist=pulse(t,63,68);
    c.parts.arms[0].rotation.z+=shoulder*(.85+.12*Math.sin(t*4));
    c.root.getObjectByName('Tigger-elbow-near').rotation.z+=elbow*(.65+.22*Math.sin(t*5));
    tigerHand.rotation.z+=wrist*.3*Math.sin(t*6);
    // Squash sesaat saat bersiap menyapa; kembali ke proporsi normal, tanpa memanjangkan badan.
    const anticipation=.22*pulse(t,60,62.5);
    c.root.scale.y*=1-anticipation;
    c.root.scale.x*=1+anticipation*.35;c.root.scale.z*=1+anticipation*.35;
   }
   if(fall>0){
    c.root.axis.set(-Math.sin(yaw),0,Math.cos(yaw));c.root.axisAngle=-1.4*fall;
    if(i===2){
     // Badan Tigger yang memanjang berguling ke samping saat jatuh.
     c.root.axis.set(-1,0,0);c.root.axisAngle=1.57*fall;
     c.root.position.x+=.35*fall;c.root.position.z-=1.75*fall;
    }
    c.parts.arms.forEach((arm,j)=>arm.rotation.z+=(j?1:-1)*.8*fall);
    c.parts.legs.forEach((leg,j)=>leg.rotation.x+=(j?1:-1)*.45*fall);
   }
   // 4. Dukungan lantai berdasarkan vertex dunia setelah seluruh rotasi/skala.
   c.root.updateWorld();c.root.position.y=FLOOR+.015-lowestPoint(c.root);c.root.updateWorld();
  });
  // 5. Kontak: posisi penolong mengikuti titik pegangan dunia pada X/Z.
  const pig=characters[1],tiger=characters[2];
  let d=average(poohHands).sub(average(pigHands));
  const pigGrip=blend(t,19,21)*(1-blend(t,48.8,50));
  pig.root.position.x+=d.x*pigGrip;pig.root.position.z+=d.z*pigGrip;pig.root.updateWorld();
  const target=point(pig.body,[0,.05,-.5]);
  d=target.clone().sub(point(tigerHand));const tigerGrip=blend(t,28.5,30.5)*(1-blend(t,49.5,51));
  tiger.root.position.x+=d.x*tigerGrip;tiger.root.position.z+=d.z*tigerGrip;tiger.root.updateWorld();
  root.updateWorld();
  return {pigletGripError:average(poohHands).distanceTo(average(pigHands)),tiggerGripError:target.distanceTo(point(tigerHand))};
 }
 pose(4.5);const putDown=heldPotPosition(point(poohHands[1]),0);
 return {root,set,characters,view,update(seconds){
  const t=Math.max(0,Math.min(STORY_DURATION,seconds)),contacts=pose(t);
  // 6. Properti: pot mengikuti tangan saat diangkat dan bangku saat diletakkan.
  const resting=new Vec3(-4.8,-1.6,1.65);
  if(t<4.5){pot.rotation.z=-.25*pulse(t,1,4)-.45*pulse(t,1.1,3.6);pot.position.copy(heldPotPosition(point(poohHands[1]),pot.rotation.z));}
  else{const u=blend(t,4.5,5.5);pot.position.copy(putDown).multiplyScalar(1-u).add(resting.multiplyScalar(u));pot.rotation.z=0;}
  const pick=blend(t,63.5,66);outsidePot.rotation.z=-.15*pick;
  const hand=heldPotPosition(point(poohHands[0]),outsidePot.rotation.z);
  outsidePot.position.set(.9,FLOOR,.95).multiplyScalar(1-pick).add(hand.multiplyScalar(pick));
  // 7. Kamera: interior → luar → melebar saat jatuh → penutup.
  const exterior=blend(t,5.5,12),wide=blend(t,27,31),fall=blend(t,46,48),outro=blend(t,61,65);
  // Pembuka melihat melalui kaca samping; dinding belakang menutupi sudut lama.
  view.target=[mix(-4.6,-.8,exterior)+wide*1.5+fall*.9,mix(-.25,-.35,exterior),.3*(1-exterior)];
  view.height=mix(5.8,8.2,exterior)+wide*.8+fall*.8-outro*.8;view.halfWidth=mix(3.5,6.2,exterior)+wide*1.6;
  view.yaw=mix(-.35,.82,exterior)-wide*.18+outro*.1;view.pitch=.02;
  // Kamera menyertai kedatangan Tigger agar ekor, telinga dan rotasi miring terbaca.
  const arrival=pulse(t,23,29);
  view.target[0]=mix(view.target[0],1.7,arrival);
  view.halfWidth+=1.1*arrival;
  root.updateWorld();
  const {phase,chapter}=getStoryPhase(t);
  return {time:t,phase,chapter,title:t<3?'Sedikit Terlalu Banyak Madu':t>=66?'Masih ingin madu?':'',caption:'',ended:t>=STORY_DURATION,...contacts};
 }};
}
