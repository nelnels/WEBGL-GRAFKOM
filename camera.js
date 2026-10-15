import {Vec3,perspective,lookAt,multiply} from './webgl.js';
export function createCamera(canvas,view){
  const state={yaw:0,pitch:.10,zoom:1},goal={...state};let pointer=null;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    goal.yaw-=(e.clientX-pointer.x)*.007;goal.pitch=Math.max(.02,Math.min(1.2,goal.pitch+(e.clientY-pointer.y)*.005));
    pointer.x=e.clientX;pointer.y=e.clientY;
  });
  const release=()=>{pointer=null;canvas.style.cursor='grab';};
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('wheel',e=>{e.preventDefault();goal.zoom=Math.max(.6,Math.min(1.8,goal.zoom*Math.exp(e.deltaY*.001)));},{passive:false});
  const camera={eye:new Vec3(),viewProjection:null,update(delta){
    const blend=1-Math.exp(-12*Math.min(.1,delta));for(const key of Object.keys(state))state[key]+=(goal[key]-state[key])*blend;
    const aspect=canvas.width/canvas.height,fov=36*Math.PI/180;
    const distance=Math.max(view.height/2,view.halfWidth/aspect)/Math.tan(fov/2)*state.zoom;
    const target=new Vec3(...view.target);
    camera.eye.set(target.x+distance*Math.sin(state.yaw)*Math.cos(state.pitch),target.y+distance*Math.sin(state.pitch),target.z+distance*Math.cos(state.yaw)*Math.cos(state.pitch));
    camera.viewProjection=multiply(perspective(fov,aspect,.1,100),lookAt(camera.eye,target));
  }};
  return camera;
}
