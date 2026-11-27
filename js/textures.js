/* ---------- textures ---------- */
function canvasTex(c){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
function makeFacade(){
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=256;return c;};
  const c=mk(),e=mk(),g=c.getContext('2d'),ge=e.getContext('2d'),r=rng(99);
  g.fillStyle='#f2eee8';g.fillRect(0,0,256,256);ge.fillStyle='#000';ge.fillRect(0,0,256,256);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*64,y=j*64;
    g.fillStyle='#ddd6cc';g.fillRect(x,y+57,64,7);
    g.fillStyle='#3d4b5c';g.fillRect(x+12,y+12,40,38);
    g.fillStyle='#62758b';g.fillRect(x+12,y+12,40,9);
    g.fillStyle='#e9e4dc';g.fillRect(x+31,y+12,2,38);
    if(r()<0.42){ge.fillStyle=r()<0.75?'#ffcf73':'#bfe0ff';ge.fillRect(x+12,y+12,40,38);}}
  return [canvasTex(c),canvasTex(e)];
}
function makeGround(){
  const S=1024,k=S/CH,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),r=rng(7);
  g.fillStyle='#3b3e45';g.fillRect(0,0,S,S);
  for(let i=0;i<9000;i++){const v=48+r()*34|0;g.fillStyle=`rgba(${v},${v},${v+6},.4)`;g.fillRect(r()*S,r()*S,2,2);}
  g.fillStyle='#f2c443'; const lw=0.16*k;
  for(let t=10;t<68;t+=6){g.fillRect(0,t*k,lw,3*k);g.fillRect(S-lw,t*k,lw,3*k);g.fillRect(t*k,0,3*k,lw);g.fillRect(t*k,S-lw,3*k,lw);}
  g.fillStyle='rgba(240,240,236,.92)';
  for(const z0 of [6.6,70.4]) for(let x=0.6;x<6;x+=1.1){
    g.fillRect(x*k,z0*k,0.55*k,3*k); g.fillRect((CH-x-0.55)*k,z0*k,0.55*k,3*k);
    g.fillRect(z0*k,x*k,3*k,0.55*k); g.fillRect(z0*k,(CH-x-0.55)*k,3*k,0.55*k);}
  return canvasTex(c);
}
const [facadeTex,facadeEm]=makeFacade();
const facadeMat=new THREE.MeshLambertMaterial({map:facadeTex,emissiveMap:facadeEm,emissive:0xffffff,emissiveIntensity:0,vertexColors:true});
const propMat=new THREE.MeshLambertMaterial({vertexColors:true});
const glowMat=new THREE.MeshBasicMaterial({color:0x8a8270});
const carLightMat=new THREE.MeshBasicMaterial({vertexColors:true});
const groundTex=makeGround(); groundTex.repeat.set(10,10);
const groundMat=new THREE.MeshPhongMaterial({map:groundTex,specular:0x111111,shininess:8});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(CH*10,CH*10),groundMat);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
