import * as primitives from './primitives.js';

// Primitive bernama untuk ketiga karakter; geometri tetap dibuat di primitives.js.
export function createCharacterHelpers(character, helpers=primitives) {
  const named=(mesh,type,part)=>{mesh.name=`${character}-${type}-${part}`;return mesh;};
  return {
    ELLIPSOID:(parent,part,position,radii,mat)=>named(helpers.egg(parent,position,radii,mat),'ellipsoid',part),
    ELLIPTIC_PARABOLOID:(parent,part,position,a,b,depth,mat)=>named(helpers.paraboloid(parent,position,a,b,depth,mat),'paraboloid',part),
    CYLINDER:(parent,part,a,b,radius,mat)=>named(helpers.armSegment(parent,a,b,radius,mat),'cylinder',part),
    CURVE:(parent,part,points,radius,mat)=>named(helpers.line(parent,points,radius,mat),'curve',part),
    SOURCE(parent,url) {
      const file=new URL(url).pathname.split('/').pop();
      let index=0;
      parent.traverse(mesh=>{
        if (!mesh.geometry || mesh.sourceFile) return;
        mesh.sourceFile=file;
        if (!mesh.name || !mesh.name.startsWith(character+'-')) {
          mesh.name=`${character}-${mesh.geometry.type}-${file.replace('.js','')}-${++index}`;
        }
      });
    }
  };
}
