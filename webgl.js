// Renderer dan matematika WebGL 1.0 mandiri. Tidak memakai library 3D eksternal.
export class Vec3 {
  constructor(x=0,y=0,z=0){this.set(x,y,z);}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  clone(){return new Vec3(this.x,this.y,this.z);}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  setScalar(s){return this.set(s,s,s);}
  length(){return Math.hypot(this.x,this.y,this.z);}
  normalize(){return this.multiplyScalar(1/(this.length()||1));}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
  toArray(){return [this.x,this.y,this.z];}
}
export const cross=(a,b)=>new Vec3(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
export const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
export const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
// Matriks column-major, sesuai uniformMatrix4fv(..., false, matrix).
export function multiply(a,b){
  const out=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];
  return out;
}
export function translation(x,y,z){const m=identity();m[12]=x;m[13]=y;m[14]=z;return m;}
export function scaling(x,y,z){const m=identity();m[0]=x;m[5]=y;m[10]=z;return m;}
// Rumus Rodrigues: rotasi terhadap sembarang vektor sumbu yang dinormalisasi.
export function rotationAxis(axis,angle){
  const {x,y,z}=axis.clone().normalize(),c=Math.cos(angle),s=Math.sin(angle),t=1-c;
  return new Float32Array([
    t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,
    t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,
    t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1
  ]);
}
const X=new Vec3(1,0,0),Y=new Vec3(0,1,0),Z=new Vec3(0,0,1);
export function alignY(direction){
  const target=direction.clone().normalize(),d=Math.max(-1,Math.min(1,target.y));
  if(d>.999999)return identity();
  return rotationAxis(d<-.999999?X:cross(Y,target),Math.acos(d));
}
export function perspective(fov,aspect,near,far){
  const f=1/Math.tan(fov/2),nf=1/(near-far);
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
}
export function orthographic(l,r,b,t,n,f){
  return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);
}
export function lookAt(eye,target){
  const z=eye.clone().sub(target).normalize(),x=cross(Y,z).normalize(),y=cross(z,x);
  return new Float32Array([x.x,y.x,z.x,0,x.y,y.y,z.y,0,x.z,y.z,z.z,0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function transformPoint(m,p){
  return new Vec3(m[0]*p.x+m[4]*p.y+m[8]*p.z+m[12],m[1]*p.x+m[5]*p.y+m[9]*p.z+m[13],m[2]*p.x+m[6]*p.y+m[10]*p.z+m[14]);
}
export function normalMatrix(m){
  const a=new Vec3(m[0],m[1],m[2]),b=new Vec3(m[4],m[5],m[6]),c=new Vec3(m[8],m[9],m[10]);
  const bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),det=dot(a,bc)||1;
  return new Float32Array([...bc.multiplyScalar(1/det).toArray(),...ca.multiplyScalar(1/det).toArray(),...ab.multiplyScalar(1/det).toArray()]);
}
export class Node {
  constructor(name=''){
    this.name=name;this.children=[];this.parent=null;
    this.position=new Vec3();this.rotation=new Vec3();this.scale=new Vec3(1,1,1);
    this.orientation=identity();this.axis=new Vec3(1,1,.5).normalize();this.axisAngle=0;
    this.world=identity();
  }
  add(child){if(child.parent)child.parent.children=child.parent.children.filter(n=>n!==child);child.parent=this;this.children.push(child);return this;}
  localMatrix(){
    let m=translation(...this.position.toArray());
    for(const [axis,angle]of [[X,this.rotation.x],[Y,this.rotation.y],[Z,this.rotation.z]])m=multiply(m,rotationAxis(axis,angle));
    m=multiply(m,this.orientation);m=multiply(m,rotationAxis(this.axis,this.axisAngle));
    return multiply(m,scaling(...this.scale.toArray()));
  }
  // Hierarki nyata: M_world_child = M_world_parent * M_local_child.
  updateWorld(parent=identity()){this.world=multiply(parent,this.localMatrix());for(const child of this.children)child.updateWorld(this.world);}
  traverse(fn){fn(this);for(const child of this.children)child.traverse(fn);}
  getObjectByName(name){if(this.name===name)return this;for(const child of this.children){const found=child.getObjectByName(name);if(found)return found;}return null;}
}
const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
export function material({color=0xffffff,roughness=.8}={}){
  return {color:[linear(((color>>16)&255)/255),linear(((color>>8)&255)/255),linear((color&255)/255)],roughness};
}
export class Mesh extends Node {
  constructor(geometry,mat){super();this.geometry=geometry;this.material=mat;this.castShadow=true;this.receiveShadow=true;}
}
export function geometry(positions,normals,indices,type='custom',parameters={}){
  const g={positions:new Float32Array(positions),normals:new Float32Array(normals),indices:new Uint16Array(indices),type,parameters,groups:[],
    clearGroups(){this.groups=[];},addGroup(start,count,materialIndex){this.groups.push({start,count,materialIndex});}};
  if(g.positions.length/3>65535)throw new Error('Geometri terlalu besar untuk indeks WebGL 1 Uint16.');
  return g;
}
export function parametric(fn,slices=32,stacks=24){
  const positions=[],normals=[],indices=[],p=new Vec3(),a=new Vec3(),b=new Vec3(),c=new Vec3(),d=new Vec3();
  for(let i=0;i<=slices;i++)for(let j=0;j<=stacks;j++){
    const u=i/slices,v=j/stacks;fn(u,v,p);positions.push(...p.toArray());
    const uu=Math.max(.0001,Math.min(.9999,u)),vv=Math.max(.0001,Math.min(.9999,v)),e=.00005;
    fn(uu+e,vv,a);fn(uu-e,vv,b);fn(uu,vv+e,c);fn(uu,vv-e,d);
    normals.push(...cross(a.clone().sub(b),c.clone().sub(d)).normalize().toArray());
  }
  for(let i=0;i<slices;i++)for(let j=0;j<stacks;j++){
    const a=i*(stacks+1)+j,b=a+stacks+1;indices.push(a,b,a+1,b,b+1,a+1);
  }
  return geometry(positions,normals,indices,'parametric');
}
export function sphereGeometry(radius=1,width=40,height=24,phiStart=0,phiLength=Math.PI*2,thetaStart=0,thetaLength=Math.PI){
  const g=parametric((u,v,p)=>{const a=phiStart+u*phiLength,t=thetaStart+v*thetaLength;p.set(radius*Math.sin(t)*Math.cos(a),radius*Math.cos(t),radius*Math.sin(t)*Math.sin(a));},width,height);
  g.type='ellipsoid';return g;
}
export function cylinderGeometry(top,bottom,height,segments=32){
  const p=[],n=[],idx=[];
  for(let j=0;j<=1;j++)for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,r=j?top:bottom;p.push(r*Math.sin(a),(j-.5)*height,r*Math.cos(a));
    n.push(...new Vec3(Math.sin(a),(bottom-top)/height,Math.cos(a)).normalize().toArray());
  }
  for(let i=0;i<segments;i++){const b=i+segments+1;idx.push(i,i+1,b,b,i+1,b+1);}
  for(const side of [-1,1]){
    const center=p.length/3;p.push(0,side*height/2,0);n.push(0,side,0);
    for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=side>0?top:bottom;p.push(r*Math.sin(a),side*height/2,r*Math.cos(a));n.push(0,side,0);}
    for(let i=0;i<segments;i++)if(side>0)idx.push(center,center+i+1,center+i+2);else idx.push(center,center+i+2,center+i+1);
  }
  return geometry(p,n,idx,'cylinder',{radiusTop:top,radiusBottom:bottom,height});
}
export function torusGeometry(radius,tube,radial=12,tubular=64){
  return parametric((u,v,p)=>{const a=u*Math.PI*2,b=v*Math.PI*2;p.set((radius+tube*Math.cos(b))*Math.cos(a),(radius+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b));},tubular,radial);
}
export function diskGeometry(radius=1,segments=64){
  const p=[0,0,0],n=[0,0,1],idx=[];
  for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;p.push(radius*Math.cos(a),radius*Math.sin(a),0);n.push(0,0,1);}
  for(let i=0;i<segments;i++)idx.push(0,i+1,i+2);
  return geometry(p,n,idx,'disk');
}
export function latheGeometry(points,segments=64){
  const count=points.length;
  return parametric((u,v,p)=>{
    const f=v*(count-1),i=Math.min(count-2,Math.floor(f)),t=f-i;
    const radius=points[i].x*(1-t)+points[i+1].x*t,y=points[i].y*(1-t)+points[i+1].y*t,a=u*Math.PI*2;
    p.set(radius*Math.sin(a),y,radius*Math.cos(a));
  },segments,(count-1)*3);
}
// Interpolasi Catmull-Rom 3D dihitung sendiri, lalu diekstrusi menjadi tube.
export class CatmullRomCurve {
  constructor(points){this.points=points.map(p=>p.clone());}
  getPoint(t){
    const count=this.points.length,f=Math.max(0,Math.min(1,t))*(count-1),i=Math.min(count-2,Math.floor(f)),u=f-i;
    const p0=this.points[Math.max(0,i-1)],p1=this.points[i],p2=this.points[i+1],p3=this.points[Math.min(count-1,i+2)];
    const result=new Vec3();
    for(const key of ['x','y','z'])result[key]=.5*((2*p1[key])+(-p0[key]+p2[key])*u+(2*p0[key]-5*p1[key]+4*p2[key]-p3[key])*u*u+(-p0[key]+3*p1[key]-3*p2[key]+p3[key])*u*u*u);
    return result;
  }
}
export function tubeGeometry(curve,segments=48,radius=.03,radial=10){
  const p=[],n=[],idx=[];let prior=null;
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=curve.getPoint(t),tangent=curve.getPoint(Math.min(1,t+.0001)).sub(curve.getPoint(Math.max(0,t-.0001))).normalize();
    let normal=prior?prior.clone().sub(tangent.clone().multiplyScalar(dot(prior,tangent))).normalize():cross(tangent,Math.abs(tangent.y)<.9?Y:X).normalize();
    if(normal.length()<.1)normal=cross(tangent,Z).normalize();
    const binormal=cross(tangent,normal).normalize();prior=normal;
    for(let j=0;j<=radial;j++){
      const a=j/radial*Math.PI*2,v=normal.clone().multiplyScalar(Math.cos(a)).add(binormal.clone().multiplyScalar(Math.sin(a)));
      p.push(...center.clone().add(v.clone().multiplyScalar(radius)).toArray());n.push(...v.toArray());
    }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){const a=i*(radial+1)+j,b=a+radial+1;idx.push(a,a+1,b,b,a+1,b+1);}
  return geometry(p,n,idx,'curve',{segments,radius,radial});
}

const vertexShader=`
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel,uViewProjection,uLightVP;
uniform mat3 uNormal;
varying vec3 vPosition,vNormal;
varying vec4 vLight;
void main(){vec4 world=uModel*vec4(aPosition,1.0);vPosition=world.xyz;vNormal=uNormal*aNormal;vLight=uLightVP*world;gl_Position=uViewProjection*world;}`;
const fragmentShader=`
precision highp float;
uniform vec3 uColor,uCamera;
uniform float uRoughness,uReceivesShadow;
uniform sampler2D uShadow;
uniform vec2 uTexel;
varying vec3 vPosition,vNormal;
varying vec4 vLight;
float depthAt(vec2 uv){return dot(texture2D(uShadow,uv),vec4(1.0/16777216.0,1.0/65536.0,1.0/256.0,1.0));}
float shadow(vec3 n,vec3 l){
 vec3 p=vLight.xyz/vLight.w*.5+.5;
 if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0||p.z>1.0)return 1.0;
 float bias=.0008+.002*(1.0-max(dot(n,l),0.0)),sum=0.0;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)sum+=p.z-bias<=depthAt(p.xy+vec2(float(x),float(y))*uTexel)?1.0:0.0;
 return mix(1.0,.35+.65*sum/9.0,uReceivesShadow);
}
vec3 tone(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.0,1.0);}
void main(){
 vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
 vec3 l=normalize(vec3(5.0,8.0,6.0)),view=normalize(uCamera-vPosition),halfway=normalize(l+view);
 float diffuse=max(dot(n,l),0.0),visibility=shadow(n,l);
 float gloss=pow(max(dot(n,halfway),0.0),mix(72.0,8.0,uRoughness))*(1.0-uRoughness)*.22;
 float rim=pow(1.0-max(dot(n,view),0.0),3.0)*.09;
 vec3 color=tone(uColor*(.45+.15*n.y+1.22*diffuse*visibility+rim)+vec3(gloss*visibility));
 color=pow(color,vec3(1.0/2.2));
 float fog=smoothstep(22.0,55.0,distance(uCamera,vPosition));
 gl_FragColor=vec4(mix(color,vec3(.733,.906,.890),fog),1.0);
}`;
const depthVertex=`attribute vec3 aPosition;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPosition,1.0);}`;
const depthFragment=`precision highp float;void main(){vec4 p=fract(gl_FragCoord.z*vec4(16777216.0,65536.0,256.0,1.0));p-=p.xxyz*vec4(0.0,1.0/256.0,1.0/256.0,1.0/256.0);gl_FragColor=p;}`;

export class Renderer {
  constructor(canvas){
    const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
    if(!gl)throw new Error('Browser tidak mendukung WebGL. Aktifkan hardware acceleration.');
    this.gl=gl;this.canvas=canvas;this.buffers=new WeakMap();this.shadowSize=1024;
    this.program=this.compile(vertexShader,fragmentShader);this.depthProgram=this.compile(depthVertex,depthFragment);
    this.locations=this.locationsFor(this.program,['aPosition','aNormal'],['uModel','uViewProjection','uLightVP','uNormal','uColor','uCamera','uRoughness','uReceivesShadow','uShadow','uTexel']);
    this.depthLocations=this.locationsFor(this.depthProgram,['aPosition'],['uMVP']);
    this.lightVP=multiply(orthographic(-9,9,-7,10,.1,36),lookAt(new Vec3(6,10,7),new Vec3(0,.5,0)));
    this.shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shadowTexture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.shadowSize,this.shadowSize,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    this.framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.shadowTexture,0);
    const depth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.shadowSize,this.shadowSize);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Shadow framebuffer tidak lengkap.');
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  }
  compile(vs,fs){
    const gl=this.gl,program=gl.createProgram();
    for(const [type,source]of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);gl.deleteShader(shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));return program;
  }
  locationsFor(program,attributes,uniforms){
    const gl=this.gl,out={};for(const a of attributes)out[a]=gl.getAttribLocation(program,a);for(const u of uniforms)out[u]=gl.getUniformLocation(program,u);return out;
  }
  upload(g){
    if(this.buffers.has(g))return this.buffers.get(g);
    const gl=this.gl,out={};
    for(const [key,values,target]of [['positions',g.positions,gl.ARRAY_BUFFER],['normals',g.normals,gl.ARRAY_BUFFER],['indices',g.indices,gl.ELEMENT_ARRAY_BUFFER]]){
      out[key]=gl.createBuffer();gl.bindBuffer(target,out[key]);gl.bufferData(target,values,gl.STATIC_DRAW);
    }
    this.buffers.set(g,out);return out;
  }
  bind(mesh,locations,normal=false){
    const gl=this.gl,b=this.upload(mesh.geometry);
    gl.bindBuffer(gl.ARRAY_BUFFER,b.positions);gl.vertexAttribPointer(locations.aPosition,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(locations.aPosition);
    if(normal){gl.bindBuffer(gl.ARRAY_BUFFER,b.normals);gl.vertexAttribPointer(locations.aNormal,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(locations.aNormal);}
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.indices);
  }
  render(scene,camera){
    const gl=this.gl;scene.updateWorld();const meshes=[];scene.traverse(n=>{if(n.geometry)meshes.push(n);});
    gl.disable(gl.DITHER); // Packed depth harus disimpan persis, tanpa dithering warna.
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);gl.viewport(0,0,this.shadowSize,this.shadowSize);
    gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.depthProgram);
    for(const mesh of meshes)if(mesh.castShadow){this.bind(mesh,this.depthLocations);gl.uniformMatrix4fv(this.depthLocations.uMVP,false,multiply(this.lightVP,mesh.world));gl.drawElements(gl.TRIANGLES,mesh.geometry.indices.length,gl.UNSIGNED_SHORT,0);}
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.enable(gl.DITHER);gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clearColor(.733,.906,.890,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
    const u=this.locations;gl.uniformMatrix4fv(u.uViewProjection,false,camera.viewProjection);gl.uniformMatrix4fv(u.uLightVP,false,this.lightVP);
    gl.uniform3fv(u.uCamera,camera.eye.toArray());gl.uniform2f(u.uTexel,1/this.shadowSize,1/this.shadowSize);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.shadowTexture);gl.uniform1i(u.uShadow,0);
    for(const mesh of meshes){
      this.bind(mesh,u,true);gl.uniformMatrix4fv(u.uModel,false,mesh.world);gl.uniformMatrix3fv(u.uNormal,false,normalMatrix(mesh.world));
      gl.uniform1f(u.uReceivesShadow,mesh.receiveShadow?1:0);
      const groups=mesh.geometry.groups.length?mesh.geometry.groups:[{start:0,count:mesh.geometry.indices.length,materialIndex:0}];
      for(const group of groups){const mat=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material;
        gl.uniform3fv(u.uColor,mat.color);gl.uniform1f(u.uRoughness,mat.roughness);
        gl.drawElements(gl.TRIANGLES,group.count,gl.UNSIGNED_SHORT,group.start*2);
      }
    }
  }
}
