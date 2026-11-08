import {material} from '../../core/webgl.js';
export function buildMaterials(black) {
  const skin = material({ color: 0xf5b1bc, roughness: .76 });
  const innerEar = material({ color: 0xe885a6, roughness: .8 });
  const outfit = material({ color: 0xe04b91, roughness: .82 });
  const stripe = material({ color: 0x8f2254, roughness: .84 });
  const expression = material({ color: 0x743c49, roughness: .85 });
  const noseMaterial = material({ color: 0xdf7c9c, roughness: .7 });
  return {skin,innerEar,outfit,stripe,expression,noseMaterial,black};
}
