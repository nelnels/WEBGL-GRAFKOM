import {Mesh,sphereGeometry} from '../../core/webgl.js';

export function buildTorso(parent,helpers,materials) {
  const {ELLIPSOID,SOURCE}=helpers;
  const {yellow,red}=materials;
  const body=parent;
  ELLIPSOID(body,'perut',[0,-.59,.14],[1.89,1.80,1.36],yellow);
  const shirtEnd=1.96;
  const shirt=new Mesh(sphereGeometry(1,64,40,0,Math.PI*2,0,shirtEnd),red);
  shirt.name='Pooh-ellipsoid-baju';
  shirt.position.set(0,.96,.03);shirt.scale.set(1.70,1.03,1.33);body.add(shirt);

  SOURCE(parent,import.meta.url);

}
