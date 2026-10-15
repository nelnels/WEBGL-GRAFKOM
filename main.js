import {Node,Renderer} from './webgl.js';
import * as primitives from './primitives.js';
import {createEnvironment} from './environment.js';
import {createCamera} from './camera.js';
import {createCharacterTransforms,createDemoControls} from './character-transforms.js';

async function start(){
  const canvas=document.querySelector('#scene');
  const id=document.body.dataset.character||'pooh';
  const choices={
    pooh:{file:'pooh.js',factory:'createPooh',position:[0,0,0]},
    piglet:{file:'piglet.js',factory:'createPiglet',position:[0,-.55,0]},
    tigger:{file:'tigger.js',factory:'createTigger',position:[.35,.25,0]}
  };
  const selected=choices[id];if(!selected)throw new Error('Karakter tidak dikenal.');
  // Hanya satu model dibangun dan dirender pada setiap halaman.
  const module=await import('./'+selected.file),character=module[selected.factory](primitives);
  character.root.position.set(...selected.position);
  const scene=new Node('Scene');scene.add(createEnvironment());scene.add(character.root);
  const renderer=new Renderer(canvas),camera=createCamera(canvas,character.view);
  const motion=createCharacterTransforms({root:character.root,body:character.body});
  const pages=['pooh.html','piglet.html','tigger.html'];
  const controls=createDemoControls(window,index=>{const url=new URL(pages[index],location.href);if(url.pathname!==location.pathname)location.assign(url.href);});
  let previous=performance.now(),time=0,lost=false,first=true;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  function frame(now){
    const delta=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
    if(!controls.state.paused)time+=delta;
    if(!lost){
      const ratio=Math.min(devicePixelRatio||1,2),width=Math.max(1,Math.floor(canvas.clientWidth*ratio)),height=Math.max(1,Math.floor(canvas.clientHeight*ratio));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      character.update(time);motion.update(time,delta,controls.state.mode,controls.update(time));
      camera.update(delta);renderer.render(scene,camera);
      canvas.dataset.mode=controls.state.mode||'normal';
      if(first){
        const error=renderer.gl.getError();if(error!==renderer.gl.NO_ERROR)throw new Error('WebGL error '+error);
        document.body.dataset.ready='true';first=false;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function fail(error){
  console.error(error);document.body.dataset.error=error.message;
  const message=document.createElement('p');message.className='error';message.textContent='Tidak dapat menampilkan karakter: '+error.message;document.body.append(message);
}
start().catch(fail);
window.addEventListener('error',event=>{document.body.dataset.error=event.message;});
