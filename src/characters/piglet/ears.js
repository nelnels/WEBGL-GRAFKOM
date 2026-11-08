import {Node,Mesh,parametric} from '../../core/webgl.js';

export function buildEars(parent,helpers,materials) {
  const {CURVE,SOURCE}=helpers;
  const {skin,innerEar,noseMaterial}=materials;
  const head=parent;
  function ear(side) {
    const group = new Node(); group.position.set(side*.38,.57,-.02); head.add(group);
    // Elliptic paraboloid z=d(1-x²/a²-(y-b)²/b²) membentuk permukaan telinga.
    const geometry = parametric((r,v,p) => {
      const a=v*Math.PI*2;
      p.set(.42*r*Math.cos(a), .55+.55*r*Math.sin(a), .18*(1-r*r));
    },24,48);
    geometry.type='elliptic-paraboloid'; geometry.parameters={a:.42,b:.55,depth:.18,cy:.55};
    const front = new Mesh(geometry,skin); front.name=`Piglet-paraboloid-telinga-luar-${side}-front`; front.castShadow=true; group.add(front);
    const back = new Mesh(geometry,skin); back.scale.z=-1;
    back.name=`Piglet-paraboloid-telinga-luar-${side}-back`;
    back.castShadow=true; group.add(back);
    const inset = new Mesh(geometry,innerEar); inset.scale.set(.72,.79,.85);
    inset.name=`Piglet-paraboloid-telinga-dalam-${side}`;
    inset.position.set(0,.09,.047); group.add(inset);
    CURVE(group,'lipatan-telinga',[[side*.07,.16,.18],[side*.11,.48,.23],[side*.04,.82,.18]],.013,noseMaterial);
    group.rotation.z=-side*.9; group.rotation.x=-.24;
    return group;
  }
  const ears=[ear(-1),ear(1)];

  SOURCE(parent,import.meta.url);
  return ears;
}
