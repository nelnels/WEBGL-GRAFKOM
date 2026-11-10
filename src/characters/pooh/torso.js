export function buildTorso(parent,helpers,materials) {
  const {ELLIPSOID,SOURCE}=helpers;
  const {yellow,red}=materials;
  const body=parent;
  ELLIPSOID(body,'perut',[0,-.59,.14],[1.89,1.80,1.36],yellow);
  ELLIPSOID(body,'baju',[0,.96,.03],[1.70,1.03,1.33],red);

  SOURCE(parent,import.meta.url);

}
