/*
 * Kepala dan wajah: ellipsoid, x²/a²+y²/b²+z²/c²=1.
 * Belang: surface parametrik di atas bola satuan.
 * Alis, kumis dan garis mulut: kurva Catmull-Rom P(t), diekstrusi menjadi tube.
 * Telinga dirakit oleh ears.js pada urutan penambahan node yang sama.
 */
import {Node} from '../../core/webgl.js';
import {buildEars} from './ears.js';
export function buildHead(parent,helpers,materials) {
  const body=parent;
  const {ELLIPSOID,STRIPE,CURVE,onUnit,mix,SOURCE}=helpers;
  const {orange,cream,white,nose,mouth,tongue,black,whisker}=materials;
  const head=new Node(); head.name='Tigger-head'; head.position.set(1.20,.92,.06);
  head.scale.setScalar(.88); body.add(head);
  const skull=ELLIPSOID(head,'tengkorak',[0,.06,0],[.63,.82,.55],orange);

  // Belang kepala (SURFACE) pada ellipsoid tengkorak: tiga di dahi, tiga di tiap pelipis.
  [[0,0],[.40,-.14],[-.40,.14]].forEach(([az0,slant],i)=>STRIPE(skull,`belang-dahi-${i}`,(s,c,p)=>{
    onUnit(mix(.16,.95,s),az0+slant*s+c*.13,p);
  }));
  for(const side of [-1,1]) [1.12,1.45,1.78].forEach((theta,i)=>STRIPE(skull,`belang-pelipis-${i}-${side}`,(s,c,p)=>{
    onUnit(theta-.12*s+c*.11,side*mix(1.95,1.05,s),p);
  }));

  // Wajah krem (ELLIPSOID): dagu panjang, pipi, kelopak mata, hidung, mulut, lidah.
  ELLIPSOID(head,'dagu',[0,-.36,.28],[.52,.72,.42],cream);
  ELLIPSOID(head,'mulut',[0,-.40,.755],[.29,.38,.07],mouth);
  ELLIPSOID(head,'lidah',[0,-.58,.80],[.16,.10,.04],tongue);
  ELLIPSOID(head,'hidung',[0,.10,.96],[.26,.17,.15],nose);
  for(const side of [-1,1]) {
    const tag=side<0?'kiri':'kanan';
    ELLIPSOID(head,`kelopak-mata-${tag}`,[side*.18,.30,.47],[.19,.29,.10],white);
    ELLIPSOID(head,`mata-${tag}`,[side*.16,.31,.565],[.048,.085,.035],black);
    ELLIPSOID(head,`pipi-${tag}`,[side*.26,-.02,.70],[.34,.28,.27],cream);

    buildEars(head,{...helpers,side,tag},materials);

    // Alis dan kumis (CURVE).
    CURVE(head,`alis-${tag}`,[[side*.07,.60,.46],[side*.20,.66,.44],[side*.30,.60,.43]],.023,black);
    for(const j of [-1,0,1]) CURVE(head,`kumis-${tag}-${j+1}`,[[side*.34,-.05+j*.06,.82],[side*.59,.01+j*.11,.82],[side*.79,.03+j*.15,.77]],.009,whisker);
  }
  CURVE(head,'garis-mulut',[[-.29,-.21,.94],[0,-.29,.94],[.29,-.21,.94]],.018,mouth);
  SOURCE(head,import.meta.url);
  return head;
}
