/* ---------- textures ---------- */
function canvasTex(c){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
/* Facade atlas: one 1024x512 image holding 6 window styles in a 4x2 grid, so every building in a block can
   pick its own style and the block still draws with one material. Each tile is 4 x 4 window bays (64 px each);
   one bay is 4 m wide and one floor (3.5 m) tall. A second image of the same layout holds the lit windows for night. */
const FACADES=['classic','glass','brick','ribbon','deco','house'];
function makeFacade(){
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const c=mk(1024,512),e=mk(1024,512),g=c.getContext('2d'),ge=e.getContext('2d'),r=rng(99);
  ge.fillStyle='#000';ge.fillRect(0,0,1024,512);
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const lit=(x,y,w,h,p)=>{if(r()<p){ge.fillStyle=r()<0.75?'#ffcf73':'#bfe0ff';ge.fillRect(x,y,w,h);}};
  const paint={  // each paints one bay at (x, y); walls stay light so the building colour tints them
    classic(x,y){R(x,y+57,64,7,'#ddd6cc');R(x+12,y+12,40,38,'#3d4b5c');R(x+12,y+12,40,9,'#62758b');R(x+31,y+12,2,38,'#e9e4dc');lit(x+12,y+12,40,38,0.42);},
    glass(x,y){R(x,y+50,64,14,'#a3afbb');R(x+4,y+2,56,46,'#5b7690');R(x+4,y+2,56,12,'#7f9ab3');R(x+31,y+2,2,46,'#d5dde5');lit(x+4,y+2,56,46,0.35);},
    brick(x,y){for(let b=0;b<64;b+=6){R(x,y+b,64,1,'#d6ccc0');for(let j=((b/6)%2)*7;j<64;j+=14)R(x+j,y+b,1,6,'#d6ccc0');}
      R(x+16,y+10,32,4,'#f4efe6');R(x+18,y+14,28,36,'#38434f');R(x+18,y+14,28,8,'#55667a');R(x+31,y+14,2,36,'#efe9e2');R(x+15,y+50,34,4,'#f6f2ea');lit(x+18,y+14,28,36,0.4);},
    ribbon(x,y){R(x,y+14,64,32,'#9aa4ae');R(x,y+16,64,28,'#34404d');R(x,y+16,64,7,'#506275');for(let m=0;m<64;m+=16)R(x+m,y+16,2,28,'#9aa4ae');lit(x,y+16,32,28,0.45);lit(x+32,y+16,32,28,0.45);},
    deco(x,y){R(x,y,6,64,'#faf5ea');R(x+6,y,1,64,'#d6ccba');R(x+58,y,6,64,'#faf5ea');R(x+14,y+56,36,8,'#cbbfa9');
      for(const wx of [14,36]){R(x+wx,y+6,14,50,'#36414d');R(x+wx,y+6,14,10,'#566a7e');lit(x+wx,y+6,14,50,0.4);}},
    house(x,y){for(let b=3;b<64;b+=5)R(x,y+b,64,1,'#e3ded4');R(x+11,y+16,6,28,'#9aa38c');R(x+47,y+16,6,28,'#9aa38c');
      R(x+17,y+13,30,34,'#ffffff');R(x+20,y+16,24,28,'#3c4a58');R(x+20,y+16,24,8,'#5a6e82');R(x+31,y+16,2,28,'#ffffff');R(x+20,y+29,24,2,'#ffffff');lit(x+20,y+16,24,28,0.5);},
  };
  FACADES.forEach((name,idx)=>{
    const tx=(idx%4)*256,ty=(1-Math.floor(idx/4))*256;  // the image is flipped when uploaded, so row 0 is the bottom half
    R(tx,ty,256,256,name==='glass'?'#d5dde5':name==='ribbon'?'#e9e6e0':name==='house'?'#f4f1ea':'#f1ece4');
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)paint[name](tx+i*64,ty+j*64);
  });
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
// Wall UVs repeat per 16 m x 14 m and carry the style as u + style*64 (see GB.box). This shader patch turns that
// into a spot inside the style's atlas tile. textureGrad keeps the far-away blur level right across tile repeats.
facadeMat.onBeforeCompile=sh=>{
  const grad=renderer.capabilities.isWebGL2;
  sh.fragmentShader=sh.fragmentShader
    .replace('void main() {',`vec4 facadeTex(sampler2D s){
  vec2 u=vUv;float idx=floor(u.x/64.0);u.x-=idx*64.0;
  vec2 a=(vec2(mod(idx,4.0),floor(idx/4.0))+fract(u))/vec2(4.0,2.0);
  ${grad?'vec2 g=u/vec2(4.0,2.0);return textureGrad(s,a,dFdx(g),dFdy(g));':'return texture2D(s,a);'}
}
void main() {`)
    .replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vUv )','facadeTex( map )'))
    .replace('#include <emissivemap_fragment>',THREE.ShaderChunk.emissivemap_fragment.replace('texture2D( emissiveMap, vUv )','facadeTex( emissiveMap )'));
};
const propMat=new THREE.MeshLambertMaterial({vertexColors:true});
const glowMat=new THREE.MeshBasicMaterial({color:0x8a8270,vertexColors:true});  // k.G boxes: white = normal lamp glow, other colours tint it
const carLightMat=new THREE.MeshBasicMaterial({vertexColors:true});
const groundTex=makeGround(); groundTex.repeat.set(10,10);
const groundMat=new THREE.MeshPhongMaterial({map:groundTex,specular:0x111111,shininess:8});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(CH*10,CH*10),groundMat);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
