import {Node,Vec3,transformPoint} from '../core/webgl.js';
import * as primitives from '../geometry/primitives.js';
import {createPooh} from '../characters/pooh/index.js';
import {createPiglet} from '../characters/piglet/index.js';
import {createTigger} from '../characters/tigger/index.js';
import {createDoorwaySet,FLOOR} from '../scene/doorway-set.js';

export const STORY_DURATION=68;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const blend=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,u)=>a+(b-a)*u;
const pulse=(t,a,b)=>blend(t,a,a+.5)*(1-blend(t,b-.5,b));
const effort=t=>.7*blend(t,30.5,33)*(1-blend(t,35.5,38.5))+blend(t,40.5,47.8)*(1-blend(t,48,48.5));
function lowestPoint(root){
 let low=Infinity;root.traverse(m=>{if(!m.geometry)return;const p=m.geometry.positions,w=m.world;
 for(let j=0;j<p.length;j+=3)low=Math.min(low,w[1]*p[j]+w[5]*p[j+1]+w[9]*p[j+2]+w[13]);});return low;
}
const point=(node,p=[0,0,0])=>transformPoint(node.world,new Vec3(...p));
const average=nodes=>nodes.reduce((p,n)=>p.add(point(n)),new Vec3()).multiplyScalar(1/nodes.length);

export function createStory(){
 const root=new Node('Pooh-stuck-in-the-door');
 const {root:set,pot,outsidePot}=createDoorwaySet();root.add(set);
 const characters=[createPooh(primitives),createPiglet(primitives),createTigger(primitives)],sizes=[.48,.72,.78];
 const saved=characters.map(c=>{
  root.add(c.root);const rest=[];c.root.traverse(node=>rest.push({node,position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()}));return rest;
 });
 const poohHands=characters[0].parts.arms.map(a=>a.children[3]);
 const pigHands=characters[1].parts.arms.map(a=>a.children.at(-1));
 const tigerHand=root.getObjectByName('Tigger-front-paw-near');
 const view={target:[-1,-.25,0],height:9,halfWidth:7,yaw:-.85,pitch:.02};
 function pose(t){
  const pulling=effort(t),released=blend(t,48,49.2);
  characters.forEach((c,i)=>{
   saved[i].forEach(r=>{r.node.position.copy(r.position);r.node.rotation.copy(r.rotation);r.node.scale.copy(r.scale);});
   const yaw=i===0?mix(-Math.PI/2,Math.PI/2,blend(t,5,6.5)):i===1?-Math.PI/2:Math.PI;
   c.root.rotation.set(0,yaw,0);c.root.scale.setScalar(sizes[i]);c.root.axis.set(1,1,.5).normalize();c.root.axisAngle=0;
   const fall=blend(t,48.5+i*.45,50.5+i*.45)*(1-blend(t,56+i*.7,59.5+i*.7));
   const walk=i===0?pulse(t,5,10):i===1?pulse(t,14,19):pulse(t,23,29);
   c.parts.head.rotation.set(.06,0,0);
   c.parts.legs.forEach((leg,j)=>leg.rotation.x=(j?1:-1)*Math.sin(t*6)*.19*walk);
   c.parts.arms.forEach((arm,j)=>arm.rotation.set((j?1:-1)*Math.sin(t*6)*.14*walk,0,0));
   if(i===0){
    const squeeze=.15*pulse(t,47.7,49.6);
    c.root.scale.x*=1-squeeze;c.root.scale.y*=1+squeeze*.35;
    const stuck=pulse(t,10,48),strain=pulling*.15;
    c.root.position.set(mix(-4.6,-2.08,blend(t,5.5,10))+.06*Math.sin(t*4)*pulse(t,10.5,14)+strain+released*2.2,0,0);
    c.body.rotation.x=-.06*pulling;
    const eat=pulse(t,0,4.5);
    c.parts.arms[1].rotation.set(-1.5*eat,0,-.55*eat);
    c.parts.head.rotation.x=.12*eat+.12*stuck;
    for(const [j,arm]of c.parts.arms.entries()){
     arm.rotation.x=mix(arm.rotation.x,-1.08,blend(t,11,16)*(1-blend(t,48.8,50)));
     arm.rotation.z+=(j===0?1:-1)*.65*blend(t,11,16)*(1-blend(t,48.8,50));
    }
    c.parts.head.rotation.y=.3*Math.sin(t*2)*pulse(t,10.5,14);
    c.parts.arms[0].rotation.x-=.8*blend(t,63,66);
    c.parts.head.rotation.x+=.3*blend(t,63,66);
   }
   if(i===1){
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
   }
   if(fall>0){
    c.root.axis.set(-Math.sin(yaw),0,Math.cos(yaw));c.root.axisAngle=-1.4*fall;
    if(i===2){
     // Tigger's long body rolls onto its side instead of balancing on its tail.
     c.root.axis.set(-1,0,0);c.root.axisAngle=1.57*fall;
     c.root.position.x+=.35*fall;c.root.position.z-=1.75*fall;
    }
    c.parts.arms.forEach((arm,j)=>arm.rotation.z+=(j?1:-1)*.8*fall);
    c.parts.legs.forEach((leg,j)=>leg.rotation.x+=(j?1:-1)*.45*fall);
   }
   c.root.updateWorld();c.root.position.y=FLOOR+.015-lowestPoint(c.root);c.root.updateWorld();
  });
  // Rigid contact constraints: helpers follow the grip, not a separate guessed path.
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
 pose(4.5);const putDown=point(poohHands[1]).add(new Vec3(0,-.3,0));
 return {root,set,characters,view,update(seconds){
  const t=Math.max(0,Math.min(STORY_DURATION,seconds)),contacts=pose(t);
  const resting=new Vec3(-4.8,-1.6,1.65);
  if(t<4.5){pot.position.copy(point(poohHands[1])).add(new Vec3(0,-.3,0));pot.rotation.z=-.25*pulse(t,1,4);}
  else{const u=blend(t,4.5,5.5);pot.position.copy(putDown).multiplyScalar(1-u).add(resting.multiplyScalar(u));pot.rotation.z=0;}
  const pick=blend(t,63.5,66),hand=point(poohHands[0],[0,0,.8]).add(new Vec3(0,-.3,0));
  outsidePot.position.set(.9,FLOOR,.95).multiplyScalar(1-pick).add(hand.multiplyScalar(pick));
  outsidePot.rotation.z=-.15*pick;
  const exterior=blend(t,5.5,12),wide=blend(t,27,31),fall=blend(t,46,48),outro=blend(t,61,65);
  view.target=[mix(-4,-.8,exterior)+wide*1.5+fall*.9,-.35,0];
  view.height=8.2+wide*.8+fall*.8-outro*.8;view.halfWidth=6.2+wide*1.6;
  view.yaw=mix(-.85,.82,exterior)-wide*.18+outro*.1;view.pitch=.02;
  root.updateWorld();
  const phase=t<10?'eat':t<14?'stuck':t<24?'piglet':t<30?'help':t<48?'pull':t<55?'fall':t<63?'rise':'honey';
  const chapter=['eat','stuck','piglet','help','pull','fall','rise','honey'].indexOf(phase);
  return {time:t,phase,chapter,title:t<3?'Sedikit Terlalu Banyak Madu':t>=66?'Masih ingin madu?':'',caption:'',ended:t>=STORY_DURATION,...contacts};
 }};
}
