import {Node} from '../../core/webgl.js';

export function buildLimbs(parent,helpers,materials) {
  const {ELLIPSOID,CURVE,CYLINDER,SOURCE}=helpers;
  const {yellow,red}=materials;
  const body=parent;
  function arm(side){
    const group=new Node(`Pooh-arm-${side}`);body.add(group);
    const shoulder=[side*1.34,1.25,.02],elbow=[side*2.08,.48,.22],wrist=[side*2.00,-.46,.42];
    CURVE(group,'lengan',[shoulder,elbow,wrist],.30,yellow).name=`Pooh-arm-curve-${side}`;
    CYLINDER(group,'lengan-baju',shoulder,[side*1.67,.91,.06],.39,red);ELLIPSOID(group,'bahu',shoulder,[.40,.39,.37],red);
    const paw=ELLIPSOID(group,'telapak-tangan',[side*2.00,-.55,.42],[.36,.29,.37],yellow);paw.rotation.z=-side*.3;
    ELLIPSOID(group,'ibu-jari',[side*1.80,-.48,.65],[.17,.20,.17],yellow);
    group.position.set(...shoulder);
    for(const child of group.children)child.position.sub(group.position);
    return group;
  }
  const arms=[arm(-1),arm(1)];
  // Proporsi kaki yang sudah disetujui tetap sama.
  const legs=[];
  for(const side of [-1,1]){
    const leg=new Node(`Pooh-leg-${side}`);leg.position.set(side*1.30,-1.59,.35);leg.rotation.y=side*.22;body.add(leg);legs.push(leg);
    ELLIPSOID(leg,'pangkal-kaki',[0,.02,0],[.65,.57,.72],yellow);
    ELLIPSOID(leg,'telapak-kaki',[side*.29,-.08,.48],[.57,.48,.74],yellow);
    ELLIPSOID(leg,'ujung-kaki',[side*.39,-.03,.91],[.58,.63,.50],yellow).rotation.x=-.12;
  }

  SOURCE(parent,import.meta.url);
  return {arms,legs};
}
