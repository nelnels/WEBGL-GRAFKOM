import {Vec3} from '../../core/webgl.js';
export function buildTorso(parent,helpers,materials) {
  const body=parent;
  const {SURFACE,STRIPE,ELLIPSOID,ELLIPSOID_BAND,TAU,mix,clamp01,SOURCE}=helpers;
  const {orange,cream}=materials;
  function torsoPoint(t,a,offset=0) {
    const hip=Math.exp(-(((t-.22)/.26)**2));
    const chest=Math.exp(-(((t-.81)/.18)**2));
    const waist=Math.exp(-(((t-.54)/.19)**2));
    const envelope=Math.sqrt(Math.max(0,1-(2*t-1)**2));
    const cy=.18*hip-.12*waist+.14*t;
    const ry=envelope*(.31+.28*hip+.17*chest)+offset;
    const rz=envelope*(.32+.24*hip+.09*chest)+offset;
    return new Vec3(-1.30+2.48*t,cy+ry*Math.sin(a),rz*Math.cos(a));
  }
  // [TIGGER - HIERARCHICAL TRANSFORMATION] Mesh loft dan tambalan mengikuti Body tanpa pivot gerak tambahan.
  const torso=SURFACE(body,'torso',(u,v,p)=>p.copy(torsoPoint(u,v*TAU)),96,48,orange);
  torso.castShadow=torso.receiveShadow=true;

  // Perut krem
  SURFACE(body,'perut',(u,v,p)=>{
    p.copy(torsoPoint(.30+u*.54,-Math.PI/2+(v-.5)*1.75*Math.pow(Math.sin(Math.PI*u),.7),.012));
  },48,20,cream);

  // Belang badan: runcing dari punggung ke arah perut
  const TORSO_STRIPES=[
    [.10,-.05,.050,2.05],[.19, .06,.056,2.20],[.285,-.05,.050,2.00],[.385,.06,.056,2.15],
    [.50,-.04,.046,1.90],[.62, .05,.050,2.00],[.74,-.04,.046,1.80],[.84, .04,.040,1.55]
  ];
  TORSO_STRIPES.forEach(([t0,slant,half,reach],i)=>{
    for(const side of [1,-1]) STRIPE(body,`belang-badan-${i}-${side>0?'dekat':'jauh'}`,(s,c,p)=>{
      const phi=mix(-.12,reach,s),a=Math.PI/2-side*phi;
      p.copy(torsoPoint(clamp01(t0+slant*s+c*half),a,.012));
    });
  });

  // ============================================ 2. LEHER + DADA (ELLIPSOID)
  // [TIGGER - ROTATION] 
  const neck=ELLIPSOID(body,'leher',[.87,.42,-.01],[.30,.54,.34],orange); neck.rotation.z=-.48;
  for(const [i,latitude] of [1.03,1.68].entries()) ELLIPSOID_BAND(neck,`belang-leher-${i}`,latitude,[-.60,2.0],.30);
  ELLIPSOID(body,'dada',[1.00,.15,.20],[.30,.30,.22],cream);
  SOURCE(body,import.meta.url);
  return {torso,neck};
}
