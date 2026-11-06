import {Node,Mesh,material,diskGeometry,sphereGeometry,cylinderGeometry,parametric} from '../core/webgl.js';
import {line,armSegment} from '../geometry/primitives.js';
import {block} from './story-props.js';

export const KITE_SNAG=[3.15,3.65,-1.1];
export function createEnvironment(){
  const root=new Node('Hundred-Acre-Wood'),swaying=[];
  const grass=material({color:0x72865a}),darkGrass=material({color:0x4e6a43});
  const bark=material({color:0x70503c}),wood=material({color:0xaf8255}),cutWood=material({color:0xd0ac74});
  const foliage=[0x53734c,0x698449,0x849455,0x427060].map(color=>material({color}));
  const canopy=sphereGeometry(1,26,16),lowSphere=sphereGeometry(1,14,9),stone=material({color:0x8d9180});
  const ell=(parent,p,s,mat)=>{const m=new Mesh(lowSphere,mat);m.position.set(...p);m.scale.set(...s);parent.add(m);return m;};
  const ground=new Mesh(diskGeometry(65,96),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-2.27;ground.castShadow=false;root.add(ground);
  // Curving earth path leads from the house to the rescue clearing.
  const path=new Mesh(parametric((u,v,p)=>{
    const x=-9+u*19,z=-3.8+Math.sin(u*Math.PI*1.4)*2.9;
    p.set(x,-2.245,z+(v-.5)*(1.2+.4*Math.sin(u*8)));
  },90,2),material({color:0xc9af7e}));path.castShadow=false;root.add(path);
  const clearing=new Mesh(diskGeometry(4.7,72),material({color:0x90a467}));clearing.rotation.x=-Math.PI/2;clearing.position.set(1.6,-2.25,-.2);clearing.scale.y=.69;clearing.castShadow=false;root.add(clearing);
  // A stream and a real plank bridge make Tigger's entrance part of the set.
  const streamX=z=>-6.1-Math.max(0,-z)*.55+Math.sin(z*.45)*.35;
  for(const [width,y,color]of [[1.65,-2.235,0x9ca590],[1.15,-2.22,0x659c9d]]){
    const m=new Mesh(parametric((u,v,p)=>{const z=-18+u*38;p.set(streamX(z)+(v-.5)*width,y,z);},100,2),material({color,roughness:.28}));m.castShadow=false;root.add(m);
  }
  for(let i=0;i<18;i++){
    const z=-7+i*.9,x=streamX(z),side=i%2?1:-1;
    ell(root,[x+side*.83,-2.10,z],[.18+(i%3)*.05,.16,.25],stone);
    if(i%3===0)line(root,[[x-.25,-2.20,z],[x+.02,-2.20,z+.03],[x+.25,-2.20,z]],.012,material({color:0xc1d9c9}));
  }
  const bridge=new Node('Woodland-bridge');bridge.position.set(-5.8,-2.22,1.9);root.add(bridge);
  for(let i=0;i<12;i++){
    const x=-1.35+i*.245,y=.16+.20*Math.sin(i/11*Math.PI);
    const plank=block(bridge,[x,y,0],[.23,.13,1.5],i%3?wood:cutWood);plank.rotation.z=.045*Math.cos(i/11*Math.PI);
  }
  for(const z of [-.8,.8]){
    for(const x of [-1.38,0,1.38])block(bridge,[x,.70,z],[.11,1.3,.11],bark);
    line(bridge,[[-1.38,1.25,z],[0,1.40,z],[1.38,1.25,z]],.045,wood);
  }
  function tree(x,z,size,index,hero=false){
    const group=new Node(hero?'Rescue-oak':'Woodland-tree');group.position.set(x,-2.25,z);group.scale.setScalar(size);root.add(group);
    const trunk=new Mesh(cylinderGeometry(.25,.47,4.9,12),bark);trunk.position.y=2.4;group.add(trunk);
    for(const side of [-1,1]){
      armSegment(group,[0,2.2,0],[side*1.35,4.65,.15],.15,bark);
      armSegment(group,[0,.13,0],[side*.9,0,.4],.18,bark);
    }
    for(let k=0;k<7;k++){
      const a=k*2.4,r=k===6?.2:1.3;
      const crown=ell(group,[Math.cos(a)*r,4.9+Math.sin(k*1.3)*.6,Math.sin(a)*r*.7],[1.35,1.15,1.05],foliage[(index+k)%4]);crown.geometry=canopy;crown.receiveShadow=false;
    }
    if(!hero)swaying.push(group);
    if(hero){
      armSegment(group,[0,3.7,.1],[-1.8,5.4,1],.16,bark);
      armSegment(group,[-1.8,5.4,1],[-2.7,5.9,1.3],.09,bark);
      ell(group,[-1.85,5.7,.2],[.95,.75,.70],foliage[2]);
      for(const y of [1,1.8,2.6]){const knot=ell(group,[.04,y,.38],[.12,.23,.045],wood);knot.rotation.z=.3;}
    }
  }
  tree(5.25,-2.4,1.02,1,true);
  for(const [x,z,size,i]of [[-10,-8,1.15,0],[-4,-9,1.35,2],[-.6,-9,1.2,0],[3,-10,1.3,1],[8,-8,1.35,2],[11,-5,1.1,3],[-12,-3,1,2],[-9,4,.8,0],[10,3,.8,1]])tree(x,z,size,i);
  // Hobbit-like woodland home: curved roof, round door, timber frame and steps.
  const home=new Node('Pooh-woodland-home');home.position.set(-6.6,-2.25,-4.3);root.add(home);
  ell(home,[0,1.3,0],[2.1,1.75,1.15],material({color:0xc5b284}));
  ell(home,[0,2.45,-.05],[2.35,.9,1.45],darkGrass);
  ell(home,[-.25,2.95,.05],[1.6,.45,1.1],foliage[1]);
  const doorway=ell(home,[0,1.05,1.06],[.82,1.05,.10],bark);
  ell(home,[0,1.05,1.15],[.67,.91,.07],material({color:0x886342}));
  for(let i=-2;i<=2;i++)line(home,[[i*.22,.35,1.23],[i*.22,1.1,1.24],[i*.22,1.74-Math.abs(i)*.1,1.23]],.012,cutWood);
  ell(home,[.40,1.0,1.26],[.065,.065,.065],material({color:0xdab86b,roughness:.3}));
  for(const side of [-1,1]){
    ell(home,[side*1.35,1.35,.95],[.38,.42,.12],bark);
    ell(home,[side*1.35,1.35,1.05],[.29,.33,.06],material({color:0xf1cf79}));
    block(home,[side*1.35,1.35,1.13],[.045,.64,.04],wood);block(home,[side*1.35,1.35,1.13],[.58,.045,.04],wood);
  }
  block(home,[0,.10,1.5],[1.5,.20,.55],stone);block(home,[0,.04,1.95],[1.9,.08,.40],stone);
  const chimney=block(home,[1.1,3.03,-.4],[.45,1.1,.5],bark);chimney.rotation.z=-.08;
  for(let i=0;i<3;i++){const smoke=ell(home,[1.1-i*.16,3.9+i*.45,-.4],[.23+i*.1,.22+i*.1,.22+i*.1],material({color:0xd1d9cb}));smoke.castShadow=false;}
  // Low foreground planting frames the action without hiding the characters.
  let seed=41;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const flowerMats=[0xe8bf58,0xc77f77,0xc9d9a6,0xb49ac5].map(color=>material({color}));
  for(let i=0;i<45;i++){
    const x=-12+random()*24,z=-7+random()*14;
    if((x>-4&&x<5&&z>-2.5&&z<2.7)||Math.abs(x-streamX(z))<1)continue;
    const bush=new Node();bush.position.set(x,-2.23,z);root.add(bush);
    for(let k=0;k<3;k++)ell(bush,[(k-1)*.24,.18+k%2*.12,0],[.35,.28,.27],foliage[(i+k)%4]);
    if(i%2===0){
      for(let k=0;k<3;k++){
        const a=k*2.1,h=.4+k*.08;armSegment(bush,[Math.cos(a)*.2,0,0],[Math.cos(a)*.2,h,.1],.015,darkGrass);
        for(let j=0;j<5;j++){const b=j*Math.PI*.4;ell(bush,[Math.cos(a)*.2+Math.cos(b)*.075,h+Math.sin(b)*.075,.12],[.07,.07,.035],flowerMats[i%4]);}
      }
    }
  }
  // Distant soft hills and cloud banks close the horizon.
  for(const [x,z,s]of [[-20,-27,13],[0,-32,17],[23,-30,16]])ell(root,[x,-1.7,z],[s,5,s*.55],material({color:0x839b80}));
  for(const [x,y,z]of [[-12,8,-20],[1,9,-24],[14,8.5,-22]]){
    const cloud=new Node();cloud.position.set(x,y,z);root.add(cloud);
    for(let i=0;i<4;i++){const m=ell(cloud,[(i-1.5)*.8,Math.sin(i)*.3,0],[1.1,.55,.5],material({color:0xf1edda}));m.castShadow=false;}
  }
  const butterflies=[];
  for(let i=0;i<5;i++){
    const b=new Node('Woodland-butterfly');root.add(b);
    const wings=[];
    for(const side of [-1,1]){
      const wing=new Node();b.add(wing);
      ell(wing,[side*.09,0,0],[.11,.15,.025],flowerMats[i%4]).castShadow=false;wings.push(wing);
    }
    butterflies.push({root:b,wings});
  }
  root.update=t=>{
    swaying.forEach((tree,i)=>{tree.rotation.z=Math.sin(t*.45+i)*.008;});
    butterflies.forEach((b,i)=>{
      b.root.position.set(-3+i*1.8+Math.sin(t*.65+i)*.5,-.8+Math.sin(t*.9+i)*.3,-2.8+Math.cos(t*.5+i)*.4);
      b.root.rotation.y=t*.3+i;b.wings[0].rotation.y=Math.sin(t*12+i)*.7;b.wings[1].rotation.y=-Math.sin(t*12+i)*.7;
    });
  };
  root.update(0);
  return root;
}
