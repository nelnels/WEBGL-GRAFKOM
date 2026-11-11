import {Node,Vec3} from '../../core/webgl.js';
export function buildLimbs(parent,helpers,materials) {
  const body=parent;
  const {CYLINDER,ELLIPSOID,SURFACE,ELLIPSOID_BAND,TAU,SOURCE}=helpers;
  const {orange,ink}=materials;
  function CYLINDER_WITH_RINGS(parent,part,a,b,radius) {
    const mesh=CYLINDER(parent,part,a,b,radius);
    const length=new Vec3(...a).distanceTo(new Vec3(...b));
    for(const [i,y] of [-length*.22,length*.19].entries()) SURFACE(mesh,`belang-${part}-${i}`,(u,v,p)=>{
      const angle=u*TAU,width=.13*(.62+.38*Math.cos(angle));
      p.set((radius+.006)*Math.sin(angle),y+(v-.5)*width,(radius+.006)*Math.cos(angle));
    },28,8,ink);
    return mesh;
  }
  const elbows=[];
  function arm(near) {
    const tag=near?'near':'far';
    const pivot=new Node(); pivot.name=`Tigger-shoulder-${tag}`;

    // [TIGGER - HIERARCHICAL TRANSFORMATION] Body → Shoulder
    pivot.position.set(near?.70:.98,.13,near?.39:-.25); body.add(pivot);

    const end=near?[-.08,-.59,.03]:[.13,-.46,0];
    CYLINDER_WITH_RINGS(pivot,`lengan-atas-${tag}`,[0,0,0],end,.15);
    ELLIPSOID(pivot,`bahu-sendi-${tag}`,end,[.17,.19,.17],orange);

    // Shoulder → Elbow di ujung lengan atas (end) → Paw
    const elbow=new Node(); elbow.name=`Tigger-elbow-${tag}`; elbow.position.set(...end); pivot.add(elbow); elbows.push(elbow);
    CYLINDER_WITH_RINGS(elbow,`lengan-bawah-${tag}`,[0,0,0],[.32,-.30,.04],.145);
    const paw=ELLIPSOID(elbow,`telapak-tangan-${tag}`,[.38,-.43,.08],[.27,.35,.25],orange);
    
    // [TIGGER - ROTATION]
    paw.rotation.z=-.18; paw.name=`Tigger-front-paw-${tag}`;   // nama ini dipakai story.js
    return pivot;
  }
  const arms=[arm(true),arm(false)];

  // ================================= 5. KAKI (ELLIPSOID + CYLINDER)
  const knees=[];
  function leg(near) {
    const tag=near?'near':'far';
    const hip=new Node(); hip.name=`Tigger-hip-${tag}`;

    // [TIGGER - HIERARCHICAL TRANSFORMATION] Body → Hip → Knee di joint → Foot
    hip.position.set(near?-.84:-1.02,.11,near?.35:-.26); body.add(hip);

    // [TIGGER - ROTATION] paha, telapak kaki
    const thigh=ELLIPSOID(hip,`paha-${tag}`,[-.02,-.23,0],[.36,.48,.30],orange); thigh.rotation.z=-.22;
    for(const [i,theta] of [1.38,1.86].entries()) ELLIPSOID_BAND(thigh,`belang-paha-${tag}-${i}`,theta,[-Math.PI,Math.PI],.20);
    const joint=[-.18,-.51,.02];
    ELLIPSOID(hip,`sendi-lutut-${tag}`,joint,[.20,.22,.19],orange);
    const knee=new Node(); knee.name=`Tigger-knee-${tag}`;

    knee.position.set(...joint); hip.add(knee); knees.push(knee);

    CYLINDER_WITH_RINGS(knee,`betis-${tag}`,[0,0,0],[.28,-.24,.04],.17);
    const foot=ELLIPSOID(knee,`telapak-kaki-${tag}`,[.28,-.40,.16],[.28,.36,.36],orange); foot.rotation.z=.20;
    return hip;
  }
  const legs=[leg(true),leg(false)];
  SOURCE(body,import.meta.url);
  return {arms,elbows,legs,knees};
}
