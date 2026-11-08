import {buildEars} from './ears.js';
import {Node} from '../../core/webgl.js';

export function buildHead(parent,helpers,materials) {
  const {ELLIPSOID,CURVE,ELLIPTIC_PARABOLOID,SOURCE}=helpers;
  const {black,yellow,muzzle,brown}=materials;
  const head=new Node('Pooh-head');head.position.set(0,2.28,.04);parent.add(head);
  ELLIPSOID(head,'kepala',[0,.16,0],[1.57,1.43,1.17],yellow);
  buildEars(head,helpers,materials);
  for(const x of [-.80,.80])ELLIPSOID(head,'pipi',[x,-.08,.57],[.48,.51,.48],yellow);
  ELLIPTIC_PARABOLOID(head,'moncong',[0,-.23,1.19],.76,.49,.43,muzzle);
  ELLIPSOID(head,'hidung',[0,-.03,1.65],[.25,.19,.17],brown);
  for(const x of [-.49,.49])ELLIPSOID(head,'mata',[x,.37,1.12],[.105,.16,.085],black);
  CURVE(head,'senyum',[[-.55,-.53,1.19],[-.29,-.70,1.23],[.08,-.73,1.23],[.49,-.55,1.22]],.027,brown).name='Pooh-smile';
  for(const side of [-1,1])CURVE(head,'alis',[[side*.29,.72,1.10],[side*.46,.79,1.08],[side*.65,.72,1.04]],.032,brown).name=`Pooh-eyebrow-${side}`;

  SOURCE(parent,import.meta.url);
  return head;
}
