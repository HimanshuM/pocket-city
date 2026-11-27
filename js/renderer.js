/* ---------- renderer, scene, camera ---------- */
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('stage').appendChild(renderer.domElement);
const canvas = renderer.domElement;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfe3ff, 70, R*CH - 12);
const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, 0.3, 800);
const hemi = new THREE.HemisphereLight(0xd6ecff, 0x5a4a3a, 0.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:420});
sun.shadow.bias = -0.0006; scene.add(sun, sun.target);

/* sky dome with sun glow */
const skyMat = new THREE.ShaderMaterial({side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},glow:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},moonDir:{value:new THREE.Vector3(0,1,0)},moonAmt:{value:0}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top,hor,glow,sunDir,moonDir;uniform float moonAmt;varying vec3 vP;void main(){float h=clamp(vP.y,0.0,1.0);vec3 c=mix(hor,top,pow(h,0.55));float s=max(dot(normalize(vP),normalize(sunDir)),0.0);c+=glow*(pow(s,8.0)*0.55+pow(s,700.0)*1.6);float m=max(dot(normalize(vP),moonDir),0.0);c+=vec3(0.86,0.9,1.0)*moonAmt*(smoothstep(0.99955,0.9997,m)*1.1+pow(m,400.0)*0.18+pow(m,30.0)*0.05);gl_FragColor=vec4(c,1.0);}'});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500,24,12), skyMat); sky.renderOrder=-2; scene.add(sky);
const starMat = new THREE.PointsMaterial({color:0xffffff,size:1.7,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false});
{const sr=rng(5),sp=[];for(let i=0;i<700;i++){const y=0.08+sr()*0.92,a=sr()*Math.PI*2,q=Math.sqrt(1-y*y);sp.push(Math.cos(a)*q*450,y*450,Math.sin(a)*q*450);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));var stars=new THREE.Points(g,starMat);stars.renderOrder=-1;scene.add(stars);}

/* speed blur: above ~65 km/h the frame is drawn into an off-screen image first, then onto the screen with a
   20-sample zoom blur: pixels smear toward the horizon point ahead, everywhere except a small zone around
   your own car. Below that speed the frame goes straight to the screen, so the effect costs nothing then. */
const blurRT=renderer.capabilities.isWebGL2?new THREE.WebGLMultisampleRenderTarget(1,1):new THREE.WebGLRenderTarget(1,1);
const blurMat=new THREE.ShaderMaterial({uniforms:{tex:{value:blurRT.texture},amt:{value:0},carUv:{value:new THREE.Vector2(0.5,0.4)},carRad:{value:0},aspect:{value:1}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  // Streaks radiate from the horizon point ahead (a little above the middle) and have a minimum length, so the
  // road ahead and cross traffic blur too. The sharp zone is a circle around the car's spot on screen (carUv,
  // carRad, measured in screen heights). A per-pixel jitter on the sample positions hides banding.
  fragmentShader:`uniform sampler2D tex;uniform float amt,carRad,aspect;uniform vec2 carUv;varying vec2 vUv;
void main(){vec2 d=vUv-vec2(0.5,0.56);float r=max(length(d),1e-4);
  float k=amt*smoothstep(carRad,carRad*1.7,length((vUv-carUv)*vec2(aspect,1.0)));
  vec2 off=d/r*max(r,0.1)*k;
  float j=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));
  vec4 c=vec4(0.0);for(int i=0;i<20;i++)c+=texture2D(tex,vUv-off*(float(i)+j)/20.0);gl_FragColor=c/20.0;}`});
const blurScene=new THREE.Scene(),blurCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),_bs=new THREE.Vector2(),_cv=new THREE.Vector3();
{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blurMat);q.frustumCulled=false;blurScene.add(q);}
function renderFrame(){
  // builds from 65 km/h, with an extra notch above 100 km/h (27.8 m/s)
  const c=player.car,sp=c?Math.hypot(c.v,c.vl):0,amt=0.12*clamp((sp-18)/16,0,1)+0.07*clamp((sp-27.8)/6.2,0,1);
  if(amt<0.002){renderer.render(scene,camera);return;}
  renderer.getDrawingBufferSize(_bs);if(blurRT.width!==_bs.x||blurRT.height!==_bs.y)blurRT.setSize(_bs.x,_bs.y);
  renderer.setRenderTarget(blurRT);renderer.render(scene,camera);renderer.setRenderTarget(null);
  // where the car is on screen and how big it looks: a 2.2 m radius at its distance from the camera
  const u=blurMat.uniforms;_cv.copy(c.obj.position);_cv.y+=0.8;const dist=_cv.distanceTo(camera.position);_cv.project(camera);
  u.carUv.value.set(_cv.x*0.5+0.5,_cv.y*0.5+0.5);u.carRad.value=_cv.z<1?2.2/(2*dist*Math.tan(camera.fov*Math.PI/360)):0;
  u.aspect.value=camera.aspect;u.amt.value=amt;renderer.render(blurScene,blurCam);
}
