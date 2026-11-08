/* Pembungkus primitive bernama; geometri tetap dibuat oleh primitives.js. */
import * as primitives from './primitives.js';

// Ellipsoid: x²/a²+y²/b²+z²/c²=1; egg() menskalakan bola satuan.
export function ELLIPSOID(parent,part,position,radii,mat,helpers=primitives) {
  const mesh=helpers.egg(parent,position,radii,mat);
  mesh.name=`Tigger-ellipsoid-${part}`;
  return mesh;
}

// Elliptic paraboloid: z=d(1-x²/a²-y²/b²), dalam domain elips.
export function ELLIPTIC_PARABOLOID(parent,part,position,a,b,depth,mat,helpers=primitives) {
  return helpers.paraboloid(parent,position,a,b,depth,mat,`Tigger-paraboloid-${part}`);
}

// Cylinder: x²+z²=r²; armSegment() mengarahkan sumbu Y dari a ke b.
export function CYLINDER(parent,part,a,b,radius,mat,helpers=primitives) {
  const mesh=helpers.armSegment(parent,a,b,radius,mat);
  mesh.name=`Tigger-cylinder-${part}`;
  return mesh;
}

// Curve: P(t)=0.5[2P1+(-P0+P2)t+(2P0-5P1+4P2-P3)t²+(-P0+3P1-3P2+P3)t³].
// Kurva Catmull-Rom diekstrusi menjadi tube 3D oleh line().
export function CURVE(parent,part,points,radius,mat,helpers=primitives) {
  const mesh=helpers.line(parent,points,radius,mat);
  mesh.name=`Tigger-curve-${part}`;
  return mesh;
}
