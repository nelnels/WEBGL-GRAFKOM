import {Vec3,transformPoint} from './webgl.js';

export const ARBITRARY_AXIS=new Vec3(1,1,.5).normalize();
export const DEMO_MODES=['translate','rotate','scale','axis','hierarchy'];
export function createCharacterTransforms({root,body,groundY=-2.25,phase=0}){
  const base=root.position.clone(),size=root.scale.clone();
  const state={lift:0,yaw:0,scale:1,axis:0,hierarchy:0};
  return {root,body,update(t,delta,mode=null,demoTime=0){
    const wave=Math.sin(t*1.1+phase);
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
    if(Math.abs(state.axis)>.008||Math.abs(state.hierarchy)>.008){
      root.updateWorld();let lowest=Infinity;
      root.traverse(mesh=>{if(!mesh.geometry)return;const p=mesh.geometry.positions;
        for(let i=0;i<p.length;i+=3)lowest=Math.min(lowest,transformPoint(mesh.world,new Vec3(p[i],p[i+1],p[i+2])).y);
      });
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
