

export function buildEars(parent,helpers,materials) {
  const {ELLIPSOID,SOURCE}=helpers;
  const {yellow,gold}=materials;
  const head=parent;
  for(const x of [-1.13,1.13]){ELLIPSOID(head,'telinga-luar',[x,1.10,0],[.43,.45,.31],gold);ELLIPSOID(head,'telinga-dalam',[x,1.10,.14],[.25,.27,.16],yellow);}

  SOURCE(parent,import.meta.url);

}
