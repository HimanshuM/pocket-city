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
