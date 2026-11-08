import {buildEars} from './ears.js';
import {Node} from '../../core/webgl.js';

export function buildHead(parent,helpers,materials) {
  const {ELLIPSOID,CURVE,SOURCE}=helpers;
  const {skin,expression,noseMaterial,black}=materials;
  const head = new Node(); head.name='Piglet-head'; head.position.set(0,1.23,.02); parent.add(head);
  ELLIPSOID(head,'kepala',[0,.05,0],[.63,.78,.51],skin);
  ELLIPSOID(head,'pipi',[0,-.22,.13],[.62,.48,.48],skin);
  ELLIPSOID(head,'moncong',[0,-.04,.49],[.25,.20,.20],skin); // moncong ellipsoid
  ELLIPSOID(head,'hidung',[0,.015,.655],[.15,.115,.055],noseMaterial);
  for (const side of [-1,1]) {
    ELLIPSOID(head,'mata',[side*.245,.20,.478],[.047,.076,.039],black);
    CURVE(head,'alis',[[side*.14,.39,.473],[side*.23,.425,.453],[side*.30,.39,.431]],.014,expression);
  }
  CURVE(head,'senyum',[[-.24,-.22,.547],[-.12,-.32,.594],[.04,-.33,.599],[.23,-.23,.55]],.018,expression);

  const ears=buildEars(head,helpers,materials);
  SOURCE(parent,import.meta.url);
  return {head,ears};
}
