import {Node,Mesh,material,sphereGeometry,torusGeometry,latheGeometry,cylinderGeometry} from './webgl.js';
import {egg,armSegment,line,paraboloid,black} from './primitives.js';

export function createPooh(){
  const yellow=material({color:0xf6b723,roughness:.78}),gold=material({color:0xe79a16});
  const red=material({color:0xca2920}),darkRed=material({color:0xa9201b});
  const brown=material({color:0x4a251a}),honey=material({color:0xffb80c,roughness:.23});
  const clay=material({color:0xad683a,roughness:.55}),rimMaterial=material({color:0x754025});
  const root=new Node('Pooh'),body=new Node('Pooh-body');body.position.y=.05;root.add(body);
  egg(body,[0,-.48,.14],[2.08,1.69,1.43],yellow);
  const shirtEnd=1.96;
  const shirt=new Mesh(sphereGeometry(1,64,40,0,Math.PI*2,0,shirtEnd),red);
  shirt.position.set(0,.96,.03);shirt.scale.set(1.84,1.03,1.33);body.add(shirt);
  const hem=new Mesh(torusGeometry(1,.024,8,80),red);hem.rotation.x=Math.PI/2;
  hem.scale.set(1.84*Math.sin(shirtEnd),1.33*Math.sin(shirtEnd),1);
  hem.position.set(0,.96+1.03*Math.cos(shirtEnd),.03);body.add(hem);
  // Curve 3D di karakter, tanpa mengembalikan alis atau kumis.
  for(const side of [-1,1]){
    const points=[[side*1.18,1.32],[side*1.28,1.18],[side*1.32,1.04]].map(([x,y])=>
      [x,y,.03+1.33*Math.sqrt(1-(x/1.84)**2-((y-.96)/1.03)**2)+.018]);
    line(body,points,.016,darkRed).name=`Pooh-shirt-curve-${side}`;
  }
  const head=new Node('Pooh-head');head.position.set(0,2.28,.04);body.add(head);
  egg(head,[0,.16,0],[1.57,1.43,1.17],yellow);
  for(const x of [-1.13,1.13]){egg(head,[x,1.10,0],[.43,.45,.31],gold);egg(head,[x,1.10,.14],[.25,.27,.16],yellow);}
  for(const x of [-.80,.80])egg(head,[x,-.08,.57],[.48,.51,.48],yellow);
  paraboloid(head,[0,-.23,1.02],.76,.49,.43,yellow,'Pooh-muzzle-paraboloid');
  egg(head,[0,-.03,1.44],[.25,.19,.17],brown);
  for(const x of [-.49,.49])egg(head,[x,.37,1.12],[.18,.25,.12],black);
  function arm(side){
    const group=new Node(`Pooh-arm-${side}`);body.add(group);
    const shoulder=[side*1.42,1.25,.02],elbow=[side*1.94,2.54,.12],wrist=[side*.87,4.13,.12];
    armSegment(group,shoulder,elbow,.31,yellow);armSegment(group,elbow,wrist,.28,yellow);
    egg(group,elbow,[.32,.33,.32],yellow);
    armSegment(group,shoulder,[side*1.62,1.75,.06],.39,red);egg(group,shoulder,[.40,.39,.37],red);
    const paw=egg(group,[side*.82,4.20,.17],[.36,.29,.37],yellow);paw.rotation.z=-side*.3;
    egg(group,[side*.66,4.26,.40],[.17,.20,.17],yellow);
  }
  arm(-1);arm(1);
  // Proporsi kaki yang sudah disetujui tetap sama.
  for(const side of [-1,1]){
    const leg=new Node(`Pooh-leg-${side}`);leg.position.set(side*1.30,-1.59,.35);leg.rotation.y=side*.22;body.add(leg);
    egg(leg,[0,.02,0],[.65,.57,.72],yellow);
    egg(leg,[side*.29,-.08,.48],[.57,.48,.74],yellow);
    egg(leg,[side*.39,-.03,.91],[.58,.63,.50],yellow).rotation.x=-.12;
  }
  const pot=new Node('Pooh-honey-pot');pot.position.set(0,4.83,.05);body.add(pot);
  const profile=[[0,-.69],[.48,-.69],[.61,-.66],[.74,-.55],[.85,-.36],[.91,-.12],[.91,.10],[.86,.32],[.76,.49],[.68,.57],[.67,.69],[.61,.70],[.60,.58],[.69,.48],[.79,.30],[.84,.08],[.84,-.12],[.77,-.34],[.66,-.51],[.48,-.59],[0,-.59]].map(([x,y])=>({x,y}));
  pot.add(new Mesh(latheGeometry(profile,80),clay));
  const rim=new Mesh(torusGeometry(.65,.075,16,64),rimMaterial);rim.rotation.x=Math.PI/2;rim.position.y=.69;pot.add(rim);
  const top=new Mesh(cylinderGeometry(.605,.605,.035,64),honey);top.position.y=.59;pot.add(top);
  line(pot,[[.28,.61,.52],[.30,.70,.59],[.32,.56,.66],[.34,.33,.79],[.34,.10,.86]],.055,honey);
  egg(pot,[.34,.07,.86],[.075,.13,.055],honey);
  return {root,body,view:{target:[0,1.5,0],height:10,halfWidth:3.8},update(t){body.rotation.z=Math.sin(t*1.3)*.018;head.rotation.y=Math.sin(t*.8)*.10;}};
}
