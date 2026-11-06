import {Renderer} from './core/webgl.js';
import {createEnvironment} from './scene/environment.js';
import {createCamera} from './scene/camera.js';
import {createStory,STORY_DURATION} from './animation/story.js';

export function startStory(canvas){
  const story=createStory(),environment=createEnvironment();story.root.add(environment);
  const renderer=new Renderer(canvas),camera=createCamera(canvas,story.view);
  const panel=document.querySelector('#story-controls');
  const title=document.querySelector('#chapter-title'),caption=document.querySelector('#story-caption');
  const seek=document.querySelector('#story-time'),clock=document.querySelector('#story-clock'),play=document.querySelector('#play-story');
  let time=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,previous=performance.now(),lost=false,first=true;
  const toggle=()=>{if(time>=STORY_DURATION)time=0;paused=!paused;};
  play.addEventListener('click',toggle);
  document.querySelector('#replay-story').addEventListener('click',()=>{time=0;paused=false;});
  seek.addEventListener('input',()=>{time=Number(seek.value);paused=true;});
  document.querySelector('#hide-controls').addEventListener('click',()=>panel.classList.add('hidden'));
  window.addEventListener('keydown',e=>{
    if(e.target.closest('input,button,a')||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    if(e.code==='Space'){e.preventDefault();toggle();}
    if(e.code==='KeyR'){time=0;paused=false;}
    if(e.code==='KeyU')panel.classList.toggle('hidden');
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  function frame(now){
    const elapsed=Math.max(0,(now-previous)/1000);previous=now;
    if(!paused&&!document.hidden)time=Math.min(STORY_DURATION,time+elapsed);
    if(time>=STORY_DURATION)paused=true;
    const state=story.update(time);
    environment.update(time);
    const ratio=Math.min(devicePixelRatio||1,2),width=Math.max(1,Math.floor(canvas.clientWidth*ratio)),height=Math.max(1,Math.floor(canvas.clientHeight*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    if(!lost){camera.update(Math.min(elapsed,.1));renderer.render(story.root,camera);}
    title.textContent=state.title;caption.textContent=state.caption;
    seek.value=String(time);clock.textContent=`${Math.floor(time).toString().padStart(2,'0')} / 60 dtk`;
    play.textContent=time>=60?'Putar lagi':paused?'Putar':'Jeda';play.setAttribute('aria-pressed',String(!paused));
    canvas.dataset.time=time.toFixed(2);canvas.dataset.chapter=String(state.chapter);canvas.dataset.paused=String(paused);
    if(first&&!lost){const error=renderer.gl.getError();if(error!==renderer.gl.NO_ERROR)throw new Error('WebGL error '+error);document.body.dataset.ready='true';first=false;}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
