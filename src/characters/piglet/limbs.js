import {Node} from '../../core/webgl.js';

export function buildLimbs(parent,helpers,materials) {
  const {ELLIPSOID,CYLINDER,SOURCE}=helpers;
  const {skin}=materials;
  const body=parent;
  function arm(side) {
    const group=new Node(); group.position.set(side*.57,.51,0); body.add(group);
    CYLINDER(group,'lengan',[0,0,0],[side*.12,-.40,.09],.085,skin);
    ELLIPSOID(group,'siku',[side*.12,-.40,.09],[.095,.13,.10],skin);
    ELLIPSOID(group,'tangan',[side*.14,-.54,.14],[.115,.16,.12],skin);
    return group;
  }
  function leg(side) {
    const group=new Node(); group.position.set(side*.25,-.76,0); body.add(group);
    CYLINDER(group,'kaki',[0,0,0],[side*.04,-.45,.06],.07,skin);
    ELLIPSOID(group,'telapak-kaki',[side*.08,-.49,.16],[.19,.15,.27],skin);
    return group;
  }
  const arms=[arm(-1),arm(1)], legs=[leg(-1),leg(1)];

  SOURCE(parent,import.meta.url);
  return {arms,legs};
}
