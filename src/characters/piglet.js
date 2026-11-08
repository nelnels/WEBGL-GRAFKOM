import {Node,Mesh,material,parametric,torusGeometry} from '../core/webgl.js';

// Hierarki: root -> badan -> kepala -> telinga, serta badan -> lengan/kaki.
// Primitive dibuat secara prosedural; tidak ada model GLB yang dimuat.
export function createPiglet({ egg, armSegment, line, black }) {
  const skin = material({ color: 0xf5b1bc, roughness: .76 });
  const innerEar = material({ color: 0xe885a6, roughness: .8 });
  const outfit = material({ color: 0xe04b91, roughness: .82 });
  const stripe = material({ color: 0x8f2254, roughness: .84 });
  const expression = material({ color: 0x743c49, roughness: .85 });
  const noseMaterial = material({ color: 0xdf7c9c, roughness: .7 });
  const root = new Node(); root.name = 'Piglet';
  const body = new Node(); body.name = 'Piglet-body'; root.add(body);
  egg(body, [0,-.08,0], [.72,.88,.53], outfit);

  // Garis horizontal mengikuti penampang ellipsoid pakaian, bukan melayang di depannya.
  for (const y of [-.72,-.46,-.20,.06,.32,.58]) {
    const r = Math.sqrt(1 - ((y+.08)/.88)**2);
    const band = new Mesh(torusGeometry(1,.03,8,64), stripe);
    band.rotation.x = Math.PI/2; band.scale.set(.727*r,.537*r,1);
    band.position.y = y; body.add(band);
  }
  egg(body,[0,.82,0],[.23,.28,.25],skin);
  const head = new Node(); head.name='Piglet-head'; head.position.set(0,1.23,.02); body.add(head);
  egg(head,[0,.05,0],[.63,.78,.51],skin);
  egg(head,[0,-.22,.13],[.62,.48,.48],skin);
  egg(head,[0,-.04,.49],[.25,.20,.20],skin); // moncong ellipsoid
  egg(head,[0,.015,.655],[.15,.115,.055],noseMaterial);
  for (const side of [-1,1]) {
    egg(head,[side*.245,.20,.478],[.047,.076,.039],black);
    line(head,[[side*.14,.39,.473],[side*.23,.425,.453],[side*.30,.39,.431]],.014,expression);
  }
  line(head,[[-.24,-.22,.547],[-.12,-.32,.594],[.04,-.33,.599],[.23,-.23,.55]],.018,expression);

  function ear(side) {
    const group = new Node(); group.position.set(side*.38,.57,-.02); head.add(group);
    // Elliptic paraboloid z=d(1-x²/a²-(y-b)²/b²) membentuk permukaan telinga.
    const geometry = parametric((r,v,p) => {
      const a=v*Math.PI*2;
      p.set(.42*r*Math.cos(a), .55+.55*r*Math.sin(a), .18*(1-r*r));
    },24,48);
    geometry.type='elliptic-paraboloid'; geometry.parameters={a:.42,b:.55,depth:.18,cy:.55};
    const front = new Mesh(geometry,skin); front.name=`Piglet-ear-paraboloid-${side}`; front.castShadow=true; group.add(front);
    const back = new Mesh(geometry,skin); back.scale.z=-1;
    back.castShadow=true; group.add(back);
    const inset = new Mesh(geometry,innerEar); inset.scale.set(.72,.79,.85);
    inset.position.set(0,.09,.047); group.add(inset);
    line(group,[[side*.07,.16,.18],[side*.11,.48,.23],[side*.04,.82,.18]],.013,noseMaterial);
    group.rotation.z=-side*.9; group.rotation.x=-.24;
    return group;
  }
  const ears=[ear(-1),ear(1)];
  function arm(side) {
    const group=new Node(); group.position.set(side*.57,.51,0); body.add(group);
    armSegment(group,[0,0,0],[side*.12,-.40,.09],.085,skin);
    egg(group,[side*.12,-.40,.09],[.095,.13,.10],skin);
    egg(group,[side*.14,-.54,.14],[.115,.16,.12],skin);
    return group;
  }
  function leg(side) {
    const group=new Node(); group.position.set(side*.25,-.76,0); body.add(group);
    armSegment(group,[0,0,0],[side*.04,-.45,.06],.07,skin);
    egg(group,[side*.08,-.49,.16],[.19,.15,.27],skin);
    return group;
  }
  const arms=[arm(-1),arm(1)], legs=[leg(-1),leg(1)];
  return {
    root,
    body,
    parts:{head,arms,legs},
    view: {target:[0,.9,0],height:7.4,halfWidth:2.8},
    update(t) {
      const walk=Math.sin(t*2.5);
      body.rotation.z=Math.sin(t*1.25)*.025;
      head.rotation.y=Math.sin(t*.85)*.16;
      head.rotation.z=.055+Math.sin(t*1.2)*.025;
      arms[0].rotation.x=walk*.20; arms[1].rotation.x=-walk*.20;
      legs[0].rotation.x=-walk*.10; legs[1].rotation.x=walk*.10;
      ears[0].rotation.z=.9+Math.sin(t*2)*.065;
      ears[1].rotation.z=-.9+Math.sin(t*2+.8)*.065;
    }
  };
}
