import {Node,Vec3,transformPoint} from '../core/webgl.js';
import * as primitives from '../geometry/primitives.js';
import {createPooh} from '../characters/pooh.js';
import {createPiglet} from '../characters/piglet.js';
import {createTigger} from '../characters/tigger.js';
import {createKite,createKiteString} from '../scene/story-props.js';
import {KITE_SNAG} from '../scene/environment.js';

export const STORY_DURATION=60;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const blend=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,u)=>a+(b-a)*u;
const window=(t,a,b)=>blend(t,a,a+.7)*(1-blend(t,b-.7,b));
const hop=(t,a,b)=>Math.sin(Math.PI*clamp((t-a)/(b-a)))**2;
const vMix=(a,b,u)=>a.clone().multiplyScalar(1-u).add(b.clone().multiplyScalar(u));
function track(t,keys){
  for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
    const a=keys[i-1],b=keys[i],u=blend(t,a[0],b[0]);return [mix(a[1],b[1],u),mix(a[2],b[2],u)];
  }
  return keys.at(-1).slice(1);
}
const chapters=[
  [0,'Sepotong angin, sebuah petualangan','Piglet: "Lihat, Pooh! Layang-layangku terbang tinggi!"'],
  [8,'Oh, tidak!','Piglet: "Oh, tidak! Talinya tersangkut di pohon!"'],
  [15,'Sedikit terlalu tinggi','Pooh: "Hmm... lebih tinggi dari yang kukira."'],
  [25,'Serahkan pada Tigger!','Tigger: "Serahkan padaku! Aku jago melompat!"'],
  [35,'Kita coba bersama','Pooh: "Kendurkan talinya, Piglet. Tigger, raih cabang itu!"'],
  [41,'Dapat!','Tigger: "Dapat! Sekarang... waktunya turun!"'],
  [48,'Terbang lagi','Piglet: "Berhasil! Kali ini kita terbangkan bersama."'],
  [55,'Petualangan lebih indah bersama','Satu layang-layang. Tiga sahabat. Satu hari yang tidak terlupakan.']
];

export function createStory(){
  const characters=[createPooh(primitives),createPiglet(primitives),createTigger(primitives)];
  const root=new Node('Kite-rescue-story'),sizes=[.68,.95,.85];
  const bases=characters.map((c,i)=>{
    root.add(c.root);c.update(0);c.root.scale.setScalar(sizes[i]);c.root.updateWorld();
    let min=Infinity;c.root.traverse(n=>{if(!n.geometry)return;const p=n.geometry.positions;for(let j=0;j<p.length;j+=3)min=Math.min(min,transformPoint(n.world,new Vec3(p[j],p[j+1],p[j+2])).y);});
    return -2.25-min;
  });
  const {root:kite,tail}=createKite();root.add(kite);
  const stringRoot=new Node('Kite-string');root.add(stringRoot);const string=createKiteString(stringRoot);
  const view={target:[-.8,.8,-1],height:11,halfWidth:9.2,yaw:-.06,pitch:.09};
  const pigHand=characters[1].parts.arms[0].children.at(-1);
  const tigerHand=root.getObjectByName('Tigger-front-paw-near');
  return {root,characters,kite,view,update(seconds){
    const t=Math.max(0,Math.min(STORY_DURATION,seconds));
    const walkPig=window(t,8,14)+window(t,25,35),run=window(t,25,30),prepare=window(t,36,39.5);
    const leap=hop(t,38.5,44.5),party=window(t,52,59.5);
    const routes=[
      [[0,-6,-2.7],[7,-5,-2.2],[16,-1.7,.5],[22,-.9,.4],[35,-1,0],[48,-.7,.4],[60,-.7,.4]],
      [[0,-2.7,.8],[8,-2.1,.8],[14,1.6,.6],[25,2.0,.7],[29,.5,2.7],[35,-3.6,1.2],[48,-3.3,1],[60,-3.3,1]],
      [[0,-9,1.9],[25,-9,1.9],[28,-5.8,1.9],[30,-2.3,4.1],[33,2.5,3.2],[36,2.1,.6],[41,1.6,-.2],[45,2.5,.8],[53,2.8,.7],[60,2.8,.7]]
    ];
    characters.forEach((c,i)=>{
      c.update(t*(i===1?1.8:1));const [x,z]=track(t,routes[i]);
      c.root.position.set(x,bases[i],z);c.root.rotation.set(0,0,0);c.root.axis.set(1,1,.5).normalize();c.root.axisAngle=0;c.root.scale.setScalar(sizes[i]);
      c.parts.head.rotation.x=-.24*window(t,10,47);
      if(i===0){
        c.root.rotation.y=.55*window(t,8,48);c.parts.head.rotation.y=.35*window(t,8,48);
        c.parts.arms[1].rotation.z=1.55*window(t,16,25)+2.0*window(t,35,42)+party*(2.0+.22*Math.sin(t*6));
        c.body.rotation.z+=.06*window(t,35,43);
        for(const side of [-1,1]){const leg=c.root.getObjectByName(`Pooh-leg-${side}`);leg.rotation.x=side*Math.sin(t*5)*.13*window(t,7,16);}
      }
      if(i===1){
        c.root.rotation.y=.8*window(t,8,14)-.8*window(t,25,35)+.3*window(t,15,25);
        c.parts.arms[0].rotation.z=-2.0+.14*Math.sin(t*3);
        c.parts.arms[0].rotation.x=0;c.parts.arms[1].rotation.x*=walkPig;
        c.parts.arms[1].rotation.z=1.5*window(t,15,23)+party*(2+.2*Math.sin(t*6));
        for(const leg of c.parts.legs)leg.rotation.x*=walkPig;
        c.root.position.y+=.35*(hop(t,18,19.3)+hop(t,21,22.3));
      }
      if(i===2){
        c.root.rotation.y=-.15*run;
        c.body.position.y=.22+.20*Math.max(0,Math.sin(t*7))*run;
        c.root.position.y+=.28*hop(t,26.5,29.5)+.75*hop(t,30,32)+.9*hop(t,33,35)+3.3*leap;
        const squash=-.16*prepare+.13*window(t,39,42.5);
        c.root.scale.set(sizes[i]*(1-squash*.5),sizes[i]*(1+squash),sizes[i]*(1-squash*.5));
        c.root.position.y+=(bases[i]+2.25)*squash;
        c.root.axisAngle=-.24*Math.sin(Math.PI*blend(t,38.5,44.5));
        c.parts.arms[0].rotation.z=2.1*window(t,38,48)+party*(1.8+.2*Math.sin(t*6));
        c.parts.arms[1].rotation.z=party*(1.8+.2*Math.sin(t*6));
      }
    });
    root.updateWorld();
    const snag=new Vec3(...KITE_SNAG);
    // At the climax, the paw meets the actual branch, rather than missing it visually.
    const contact=blend(t,39.5,41)*(1-blend(t,41.4,43.5));
    if(contact>0){const paw=transformPoint(tigerHand.world,new Vec3());characters[2].root.position.add(snag.clone().sub(paw).multiplyScalar(contact));root.updateWorld();}
    const paw=transformPoint(tigerHand.world,new Vec3());
    const hand=transformPoint(pigHand.world,new Vec3());
    const fly=new Vec3(-1.6+Math.sin(t*.65)*.65,3.4+Math.sin(t*.9)*.25,.2);
    const finalFly=new Vec3(.7+Math.sin(t*.7)*.8,4.9+Math.sin(t*.8)*.3,-.5);
    let kiteState='flying';
    if(t<12)kite.position.copy(vMix(fly,snag,blend(t,8,12)));
    else if(t<41){kite.position.copy(snag);kiteState='stuck';}
    else if(t<48){kite.position.copy(vMix(paw.clone().add(new Vec3(.45,.25,.12).multiplyScalar(blend(t,41,42))),finalFly,blend(t,44,48)));kiteState='rescued';}
    else kite.position.copy(finalFly);
    const flutter=1-blend(t,8,12)+blend(t,44,48);
    kite.rotation.set(.05*Math.sin(t*2)*flutter,.18*Math.sin(t*.7)*flutter,-.20+.14*Math.sin(t*1.7)*flutter);
    tail.rotation.z=Math.sin(t*3)*.14;tail.rotation.x=Math.sin(t*2)*.12;
    string(hand,kite.position,.25+window(t,35,44)*1.2);
    // Deterministic camera moves remain correct when seeking backwards.
    const focus=blend(t,8,17),outro=blend(t,50,60);
    view.target=[mix(-2,1.0,focus)-outro*.7,mix(.65,1.0,focus),-.7];
    view.height=12-1.7*blend(t,0,7)+1.4*outro;view.halfWidth=9.2;
    view.yaw=-.10+.14*blend(t,25,41)-.04*outro;view.pitch=.08;
    let chapter=0;for(let i=1;i<chapters.length;i++)if(t>=chapters[i][0])chapter=i;
    return {time:t,chapter,title:chapters[chapter][1],caption:chapters[chapter][2],kiteState,ended:t>=STORY_DURATION};
  }};
}
