import {Vec3} from '../core/webgl.js';

export const ARBITRARY_AXIS=new Vec3(1,1,.5).normalize();
export const DEMO_MODES=['translate','rotate','scale','axis','hierarchy'];
export function createCharacterTransforms({root,body,groundY=-2.25,phase=0}){
  const base=root.position.clone(),size=root.scale.clone();
  // Build once. A global stride leaves room for each mesh's six extrema.
  const meshes=[];let vertexCount=0;
  root.traverse(mesh=>{if(mesh.geometry){meshes.push(mesh);vertexCount+=mesh.geometry.positions.length/3;}});
  const stride=Math.max(1,Math.ceil(vertexCount/Math.max(1,3000-meshes.length*7)));
  const groundSamples=meshes.map(mesh=>{
    const p=mesh.geometry.positions,indices=new Set();let radius=0;
    const extrema=[0,0,0,0,0,0];
    for(let i=0;i<p.length;i+=3){
      if((i/3)%stride===0)indices.add(i);
      radius=Math.max(radius,Math.hypot(p[i],p[i+1],p[i+2]));
      for(let a=0;a<3;a++){
        if(p[i+a]<p[extrema[a*2]+a])extrema[a*2]=i;
        if(p[i+a]>p[extrema[a*2+1]+a])extrema[a*2+1]=i;
      }
    }
    extrema.forEach(i=>indices.add(i));
    const points=new Float32Array(indices.size*3);let j=0;
    for(const i of indices){points[j++]=p[i];points[j++]=p[i+1];points[j++]=p[i+2];}
    return {mesh,points,sphereRadius:mesh.geometry.type==='ellipsoid'?radius:0};
  });


  const state={lift:0,yaw:0,scale:1,axis:0,hierarchy:0};
  return {root,body,groundSamples,update(t,delta,mode=null,demoTime=0){

    const wave=Math.sin(t*1.1+phase);
    //translasi Y
    const desired={lift:.025*(1+wave),yaw:.018*Math.sin(t*.65+phase),scale:1+.006*wave,axis:.006*Math.sin(t*.85+phase),hierarchy:0};

    if(mode){
      desired.lift=0;desired.yaw=0;desired.scale=1;desired.axis=0;
      const u=Math.sin(demoTime*1.6);
      if(mode==='translate')desired.lift=.45*(1-Math.cos(demoTime*1.6));
      if(mode==='rotate')desired.yaw=u*.55;
      if(mode==='scale')desired.scale=1+u*.10;
      if(mode==='axis')desired.axis=u*.18;
      if(mode==='hierarchy')desired.hierarchy=u*.13;
    }
    const blend=1-Math.exp(-7*Math.min(.1,Math.max(0,delta)));
    for(const k of Object.keys(state))state[k]+=(desired[k]-state[k])*blend;
    
    root.position.copy(base);root.position.y=groundY+(base.y-groundY)*state.scale+state.lift;
    root.scale.copy(size).multiplyScalar(state.scale);
    root.rotation.y=state.yaw;root.axis.copy(ARBITRARY_AXIS);root.axisAngle=state.axis;
    // localMatrix() menerapkan matriks Rodrigues untuk root.axis/root.axisAngle.
    body.rotation.z+=state.hierarchy;
    if(mode==='axis'||mode==='hierarchy'||Math.abs(state.axis)>.008||Math.abs(state.hierarchy)>.008){
      root.updateWorld();let lowest=Infinity;
      for(const {mesh,points:p,sphereRadius} of groundSamples){
        const m=mesh.world;
        for(let i=0;i<p.length;i+=3)lowest=Math.min(lowest,m[1]*p[i]+m[5]*p[i+1]+m[9]*p[i+2]+m[13]-.015);
        // Analytic support prevents a stride from missing a rounded foot's bottom.
        if(sphereRadius)lowest=Math.min(lowest,m[13]-sphereRadius*Math.hypot(m[1],m[5],m[9]));
      }
      root.position.y+=Math.max(0,groundY+.005-lowest);
    }
  }};
}
export function createDemoControls(target=window,onNavigate=()=>{}){
  const keys={KeyT:'translate',KeyR:'rotate',KeyS:'scale',KeyA:'axis',KeyH:'hierarchy'};
  const state={mode:null,startedAt:null,paused:false};
  const listener=e=>{
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable)return;
    if(/^Digit[123]$/.test(e.code)){onNavigate(Number(e.code.slice(-1))-1);}
    else if(keys[e.code]){state.mode=state.mode===keys[e.code]?null:keys[e.code];state.startedAt=null;}
    else if(e.code==='Escape'||e.code==='Digit0'){state.mode=null;state.startedAt=null;}
    else if(e.code==='Space')state.paused=!state.paused;
    else return;
    e.preventDefault();
  };
  target.addEventListener('keydown',listener);
  return {state,update(t){if(state.startedAt===null)state.startedAt=t;return Math.max(0,t-state.startedAt);},dispose(){target.removeEventListener('keydown',listener);}};
}
