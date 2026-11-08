import {material} from '../../core/webgl.js';
export function buildMaterials(black) {
  const yellow=material({color:0xf6b723,roughness:.78}),gold=material({color:0xe79a16});
  const red=material({color:0xca2920});
  const muzzle=material({color:0xffc54a,roughness:.8});
  const brown=material({color:0x4a251a});
  return {yellow,gold,red,muzzle,brown,black};
}
