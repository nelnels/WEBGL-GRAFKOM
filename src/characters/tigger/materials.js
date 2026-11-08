/*
 * Material warna Tigger; tidak membangun mesh atau primitive.
 * Warna sRGB dikonversi oleh material(); tidak ada rumus permukaan di modul ini.
 */

export function buildMaterials(parent,helpers,materials) {
  const {material}=helpers;
  const orange=material({color:0xe9781c,roughness:.76});
  const cream=material({color:0xfff1dc,roughness:.84});
  const white=material({color:0xfffaf0,roughness:.75});
  const nose=material({color:0xc4623e,roughness:.62});
  const mouth=material({color:0x6e2b27,roughness:.8});
  const tongue=material({color:0xe98786,roughness:.85});
  const ink=material({color:0x1d1411,roughness:.90});     // belang hitam
  const whisker=material({color:0x4a3a33,roughness:.8});
  return {orange,cream,white,nose,mouth,tongue,ink,whisker,black:materials.black};
}
