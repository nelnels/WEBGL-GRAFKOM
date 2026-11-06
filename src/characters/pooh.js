import {Node,Mesh,material,sphereGeometry,torusGeometry} from '../core/webgl.js';
import {egg,armSegment,line,paraboloid,black} from '../geometry/primitives.js';

export function createPooh(){
  const yellow=material({color:0xf6b723,roughness:.78}),gold=material({color:0xe79a16});
  const red=material({color:0xca2920});
  const brown=material({color:0x4a251a});
  const root=new Node('Pooh'),body=new Node('Pooh-body');body.position.y=.05;root.add(body);
  egg(body,[0,-.48,.14],[2.08,1.69,1.43],yellow);
  const shirtEnd=1.96;
  const shirt=new Mesh(sphereGeometry(1,64,40,0,Math.PI*2,0,shirtEnd),red);
  shirt.position.set(0,.96,.03);shirt.scale.set(1.84,1.03,1.33);body.add(shirt);
  const hem=new Mesh(torusGeometry(1,.024,8,80),red);hem.rotation.x=Math.PI/2;
  hem.scale.set(1.84*Math.sin(shirtEnd),1.33*Math.sin(shirtEnd),1);
  hem.position.set(0,.96+1.03*Math.cos(shirtEnd),.03);body.add(hem);
  const head=new Node('Pooh-head');head.position.set(0,2.28,.04);body.add(head);
  egg(head,[0,.16,0],[1.57,1.43,1.17],yellow);
  for(const x of [-1.13,1.13]){egg(head,[x,1.10,0],[.43,.45,.31],gold);egg(head,[x,1.10,.14],[.25,.27,.16],yellow);}
  for(const x of [-.80,.80])egg(head,[x,-.08,.57],[.48,.51,.48],yellow);
  paraboloid(head,[0,-.23,1.02],.76,.49,.43,yellow,'Pooh-muzzle-paraboloid');
  egg(head,[0,-.03,1.44],[.25,.19,.17],brown);
  for(const x of [-.49,.49])egg(head,[x,.37,1.12],[.18,.25,.12],black);
  function arm(side){
    const group=new Node(`Pooh-arm-${side}`);body.add(group);
    const shoulder=[side*1.42,1.25,.02],elbow=[side*2.03,.56,.12],wrist=[side*2.12,-.21,.25];
    line(group,[shoulder,elbow,wrist],.30,yellow).name=`Pooh-arm-curve-${side}`;
    armSegment(group,shoulder,[side*1.72,.91,.06],.39,red);egg(group,shoulder,[.40,.39,.37],red);
    const paw=egg(group,[side*2.12,-.30,.25],[.36,.29,.37],yellow);paw.rotation.z=-side*.3;
    egg(group,[side*1.92,-.23,.48],[.17,.20,.17],yellow);
    group.position.set(...shoulder);
    for(const child of group.children)child.position.sub(group.position);
    return group;
  }
  const arms=[arm(-1),arm(1)];
  // Proporsi kaki yang sudah disetujui tetap sama.
  for(const side of [-1,1]){
    const leg=new Node(`Pooh-leg-${side}`);leg.position.set(side*1.30,-1.59,.35);leg.rotation.y=side*.22;body.add(leg);
    egg(leg,[0,.02,0],[.65,.57,.72],yellow);
    egg(leg,[side*.29,-.08,.48],[.57,.48,.74],yellow);
    egg(leg,[side*.39,-.03,.91],[.58,.63,.50],yellow).rotation.x=-.12;
  }
  return {root,body,parts:{head,arms},view:{target:[0,1.5,0],height:10,halfWidth:3.8},update(t){body.rotation.z=Math.sin(t*1.3)*.018;head.rotation.y=Math.sin(t*.8)*.10;}};
}
