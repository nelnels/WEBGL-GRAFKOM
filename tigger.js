import {Node,Mesh,material,Vec3,parametric,CatmullRomCurve,tubeGeometry} from './webgl.js';

export function createTigger({ egg, armSegment, line, black }) {
  const orange=material({color:0xf18c24,roughness:.76});
  const cream=material({color:0xffe5b5,roughness:.84});
  const white=material({color:0xfff6df,roughness:.75});
  const nose=material({color:0xb74e36,roughness:.65});
  const mouth=material({color:0x592c27,roughness:.8});
  const tongue=material({color:0xe98786,roughness:.85});
  const ink=material({color:0x231b17,roughness:.90});
  const root=new Node(); root.name='Tigger';
  const body=new Node(); body.name='Tigger-body'; root.add(body);

  // Sumbu badan sudah membujur sepanjang X. Pinggul, pinggang, dan dada
  // dibentuk pada satu permukaan halus agar siluet tidak berupa oval yang diputar.
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
  const torsoGeometry=parametric((u,v,p)=>p.copy(torsoPoint(u,v*Math.PI*2)),96,48);
  const torso=new Mesh(torsoGeometry,orange); torso.name='Tigger-shaped-torso';
  torso.castShadow=torso.receiveShadow=true; body.add(torso);

  // Patch krem sempit di bagian bawah, mengikuti lengkung perut.
  const bellyGeometry=parametric((u,v,p)=>{
    const t=.35+u*.46;
    const a=-.89+(v-.5)*.85*Math.sin(Math.PI*u);
    p.copy(torsoPoint(t,a,.012));
  },48,20);
  const belly=new Mesh(bellyGeometry,cream); body.add(belly);
  for(const [i,t] of [.13,.24,.36,.49,.64,.79,.89].entries()) {
    const geometry=parametric((u,v,p)=>{
      const a=-.70+u*2.9;
      const shift=(i%2?1:-1)*.04*Math.sin(Math.PI*u);
      const bandT=t+shift-(v-.5)*(i%2?.085:.12)*Math.sin(Math.PI*u);
      p.copy(torsoPoint(bandT,a,.009));
    },32,8);
    body.add(new Mesh(geometry,ink));
  }

  // Leher terangkat menghubungkan dada dengan kepala, bukan menempel di ujung oval.
  const neck=egg(body,[.87,.42,-.01],[.30,.54,.34],orange); neck.rotation.z=-.48;
  for(const latitude of [1.03,1.68]) {
    const geometry=parametric((u,v,p)=>{
      const a=-.60+u*2.6;
      const theta=latitude-(v-.5)*.30*Math.sin(Math.PI*u);
      p.set(1.015*Math.sin(theta)*Math.sin(a),1.015*Math.cos(theta),1.015*Math.sin(theta)*Math.cos(a));
    },28,8);
    neck.add(new Mesh(geometry,ink));
  }
  const head=new Node(); head.name='Tigger-head'; head.position.set(1.20,.92,.06);
  head.scale.setScalar(.88); body.add(head);
  egg(head,[0,.06,0],[.63,.82,.55],orange);
  egg(head,[0,-.31,.27],[.42,.65,.34],cream);
  egg(head,[0,-.30,.588],[.27,.35,.052],mouth);
  egg(head,[0,-.50,.64],[.15,.09,.035],tongue);

  function faceStripe(latitude,angle) {
    const geometry=parametric((u,v,p)=>{
      const a=angle+(u-.5)*.64;
      const theta=latitude-(v-.5)*.18*Math.sin(Math.PI*u);
      p.set(.642*Math.sin(theta)*Math.sin(a),.06+.832*Math.cos(theta),.562*Math.sin(theta)*Math.cos(a));
    },24,8);
    head.add(new Mesh(geometry,ink));
  }
  for(const side of [-1,1]) {
    egg(head,[side*.57,.61,0],[.25,.28,.16],orange);
    egg(head,[side*.57,.61,.13],[.16,.18,.055],cream);
    egg(head,[side*.18,.30,.47],[.19,.29,.10],white);
    egg(head,[side*.16,.31,.565],[.048,.085,.035],black);
    egg(head,[side*.23,-.02,.64],[.27,.23,.23],cream);
    line(head,[[side*.07,.60,.46],[side*.20,.66,.44],[side*.30,.60,.43]],.023,black);
    for(const theta of [1.15,1.58,1.94]) faceStripe(theta,side*1.30);
    for(const j of [-1,0,1]) line(head,[[side*.34,-.05+j*.06,.82],[side*.59,.01+j*.11,.82],[side*.79,.03+j*.15,.77]],.009,mouth);
  }
  egg(head,[0,.10,.845],[.23,.16,.14],nose);
  faceStripe(.45,0);
  line(head,[[-.29,-.17,.68],[0,-.22,.69],[.29,-.17,.68]],.018,mouth);

  // Belang meruncing pada cylinder mengikuti orientasi segmen lengan/kaki.
  function stripedSegment(parent,a,b,radius) {
    const mesh=armSegment(parent,a,b,radius,orange);
    const length=new Vec3(...a).distanceTo(new Vec3(...b));
    for(const y of [-length*.22,length*.19]) {
      const geometry=parametric((u,v,p)=>{
        const angle=-1.35+u*2.7;
        p.set((radius+.006)*Math.sin(angle),y+(v-.5)*.13*Math.sin(Math.PI*u),(radius+.006)*Math.cos(angle));
      },24,8);
      mesh.add(new Mesh(geometry,ink));
    }
    return mesh;
  }
  const elbows=[];
  function arm(near) {
    const pivot=new Node(); pivot.name=`Tigger-shoulder-${near?'near':'far'}`;
    pivot.position.set(near?.70:.98,.13,near?.39:-.25); body.add(pivot);
    const end=near?[-.08,-.59,.03]:[.13,-.46,0];
    stripedSegment(pivot,[0,0,0],end,.145);
    egg(pivot,end,[.17,.19,.17],orange);
    const elbow=new Node(); elbow.position.set(...end); pivot.add(elbow); elbows.push(elbow);
    stripedSegment(elbow,[0,0,0],[.32,-.30,.04],.14);
    const paw=egg(elbow,[.38,-.43,.08],[.22,.31,.20],orange);
    paw.rotation.z=-.18; paw.name=`Tigger-front-paw-${near?'near':'far'}`;
    return pivot;
  }
  const arms=[arm(true),arm(false)];

  const knees=[];
  function leg(near) {
    const hip=new Node(); hip.name=`Tigger-hip-${near?'near':'far'}`;
    hip.position.set(near?-.84:-1.02,.11,near?.35:-.26); body.add(hip);
    const thigh=egg(hip,[-.02,-.23,0],[.36,.48,.30],orange); thigh.rotation.z=-.22;
    // Belang menyilang paha yang membulat.
    for(const y of [-.14,-.37]) {
      const geometry=parametric((u,v,p)=>{
        const a=-1.15+u*2.3;
        const yy=y+(v-.5)*.13*Math.sin(Math.PI*u);
        const factor=Math.sqrt(Math.max(0,1-((yy+.23)/.48)**2));
        p.set(-.02+.368*factor*Math.sin(a),yy,.309*factor*Math.cos(a));
      },24,8);
      hip.add(new Mesh(geometry,ink));
    }
    const joint=[-.18,-.51,.02]; egg(hip,joint,[.20,.22,.19],orange);
    const knee=new Node(); knee.name=`Tigger-knee-${near?'near':'far'}`;
    knee.position.set(...joint); hip.add(knee); knees.push(knee);
    stripedSegment(knee,[0,0,0],[.28,-.24,.04],.16);
    const foot=egg(knee,[.28,-.40,.16],[.23,.31,.30],orange); foot.rotation.z=.20;
    // Quadric: elliptic paraboloid menutup ujung telapak.
    const geometry=parametric((r,v,p)=>{
      const a=v*Math.PI*2; p.set(.19*r*Math.cos(a),.25*r*Math.sin(a),.12*(1-r*r));
    },24,32);
    const cap=new Mesh(geometry,orange); cap.name=`Tigger-foot-paraboloid-${near?'near':'far'}`; cap.position.set(.28,-.40,.39); knee.add(cap);
    return hip;
  }
  const legs=[leg(true),leg(false)];

  const tail=new Node(); tail.name='Tigger-tail'; tail.position.set(-1.15,.40,-.09); body.add(tail);
  const path=new CatmullRomCurve([
    new Vec3(0,0,0),new Vec3(-.43,.27,-.08),new Vec3(-1.03,.38,-.05),
    new Vec3(-1.58,.25,.02),new Vec3(-1.86,-.06,.06),new Vec3(-1.91,-.36,.10)
  ]);
  const segments=112,radial=12;
  const geometry=tubeGeometry(path,segments,.115,radial,false); geometry.clearGroups();
  for(let i=0;i<segments;i++) geometry.addGroup(i*radial*6,radial*6,Math.floor(i/5)%3===0?1:0);
  const tailMesh=new Mesh(geometry,[orange,ink]); tailMesh.castShadow=true; tail.add(tailMesh);
  egg(tail,path.getPoint(1).toArray(),[.12,.12,.12],ink);

  return {
    root,
    body,
    view: {target:[-.35,.5,0],height:6.2,halfWidth:3.5},
    update(t) {
      const phase=t*2.3,lift=Math.max(0,Math.sin(phase)),swing=Math.sin(phase+.4);
      body.position.set(-lift*.08,.22+lift*.64,0);
      body.rotation.set(0,.06,-.025+Math.sin(phase)*.025);
      head.rotation.set(0,-.18+Math.sin(t*.8)*.05,-.13);
      arms[0].rotation.z=-.08+swing*.13; arms[1].rotation.z=.10-swing*.13;
      elbows[0].rotation.z=-.10-lift*.22; elbows[1].rotation.z=.10-lift*.12;
      legs[0].rotation.z=-.08-lift*.15; legs[1].rotation.z=.12+lift*.12;
      knees[0].rotation.z=.18+lift*.26; knees[1].rotation.z=-.12+lift*.22;
      tail.rotation.y=Math.sin(phase-.6)*.13;
      tail.rotation.z=Math.sin(phase-.8)*.10;
    }
  };
}
