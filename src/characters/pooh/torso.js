import {Mesh,sphereGeometry,torusGeometry} from '../../core/webgl.js';

export function buildTorso(parent,helpers,materials) {
  const {ELLIPSOID,SOURCE}=helpers;
  const {yellow,red}=materials;
  const body=parent;
  ELLIPSOID(body,'perut',[0,-.59,.14],[1.89,1.80,1.36],yellow);
  const shirtEnd=1.96;
  const shirt=new Mesh(sphereGeometry(1,64,40,0,Math.PI*2,0,shirtEnd),red);
  shirt.name='Pooh-ellipsoid-baju';
  shirt.position.set(0,.96,.03);shirt.scale.set(1.70,1.03,1.33);body.add(shirt);
  const hem=new Mesh(torusGeometry(1,.024,8,80),red);hem.rotation.x=Math.PI/2;
  hem.name='Pooh-surface-kelim-baju-torus';
  hem.scale.set(1.70*Math.sin(shirtEnd),1.33*Math.sin(shirtEnd),1);
  hem.position.set(0,.96+1.03*Math.cos(shirtEnd),.03);body.add(hem);

  SOURCE(parent,import.meta.url);

}
