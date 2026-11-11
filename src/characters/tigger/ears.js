/*
 * Telinga luar dan dalam: elliptic paraboloid depan + belakang.
 * z=d(1-x²/a²-y²/b²); scale.z=-1 mencerminkan sisi belakang.
 * Lapisan oranye dan krem memakai primitive yang sama, tanpa geometri baru.
 */
import {Node,Mesh} from '../../core/webgl.js';
export function buildEars(parent,helpers,materials) {
  const head=parent;
  const {side,tag,ELLIPTIC_PARABOLOID,SOURCE}=helpers;
  const {orange,cream}=materials;
  // [TIGGER - SCALING] Pencerminan tetap pada Z (-1) membentuk sisi belakang paraboloid.
  const EAR_CUP=(parent,part,a,b,depth,mat,z=0)=>{
    const front=ELLIPTIC_PARABOLOID(parent,`${part}-front`,[0,0,z],a,b,depth,mat);
    const back=new Mesh(front.geometry,mat); back.scale.z=-1; back.position.z=-z; back.name=`Tigger-paraboloid-${part}-back`;
    parent.add(back); return front;
  };
  // [TIGGER - HIERARCHICAL TRANSFORMATION] Head → Ear → paraboloid
  // [TIGGER - ROTATION]
  const ear=new Node(`Tigger-ear-${side}`); ear.position.set(side*.57,.64,-.02);
  ear.rotation.y=side*.50; ear.rotation.z=-side*.34; head.add(ear);
  EAR_CUP(ear,`telinga-luar-${tag}`,.31,.38,.19,orange);
  EAR_CUP(ear,`telinga-dalam-${tag}`,.20,.26,.15,cream,.06);
  SOURCE(ear,import.meta.url);
  return ear;
}
