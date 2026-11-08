import {Mesh,torusGeometry} from '../../core/webgl.js';

export function buildTorso(parent,helpers,materials) {
  const {ELLIPSOID,SOURCE}=helpers;
  const {skin,outfit,stripe}=materials;
  const body=parent;
  ELLIPSOID(body,'badan', [0,-.08,0], [.72,.88,.53], outfit);

  // Garis horizontal mengikuti penampang ellipsoid pakaian, bukan melayang di depannya.
  for (const y of [-.72,-.46,-.20,.06,.32,.58]) {
    const r = Math.sqrt(1 - ((y+.08)/.88)**2);
    const band = new Mesh(torusGeometry(1,.03,8,64), stripe);
    band.name='Piglet-surface-garis-baju-torus';
    band.rotation.x = Math.PI/2; band.scale.set(.727*r,.537*r,1);
    band.position.y = y; body.add(band);
  }
  ELLIPSOID(body,'leher',[0,.82,0],[.23,.28,.25],skin);

  SOURCE(parent,import.meta.url);

}
