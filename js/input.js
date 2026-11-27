/* ---------- input ---------- */
const keys={};let started=false,dragging=false,hold=false;
const playing=()=>started&&$('intro').classList.contains('hidden');
const PREVENT=new Set(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
addEventListener('keydown',e=>{if(PREVENT.has(e.code))e.preventDefault();keys[e.code]=true;if(e.repeat)return;
  if(e.code==='KeyE')interact();if(e.code==='KeyG'&&playing()){hq=!hq;applyQuality();}if(e.code==='KeyH'&&started)showIntro(!playing());if(e.code==='KeyM')setMuted(!muted);initAudio();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;hold=false;});
canvas.addEventListener('mousedown',()=>{dragging=true;if(playing()&&!coarse&&document.pointerLockElement!==canvas){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(err){}}});
addEventListener('mouseup',()=>{dragging=false;});
addEventListener('mousemove',e=>{if(!playing())return;if(document.pointerLockElement===canvas||dragging)look(e.movementX,e.movementY);});
const joy={id:null,x0:0,y0:0,x:0,y:0},lk={id:null,x:0,y:0},joyEl=$('joy'),knob=$('knob');
canvas.addEventListener('pointerdown',e=>{initAudio();if(e.pointerType==='mouse'||!playing())return;
  if(e.clientX<innerWidth*0.45&&joy.id===null){Object.assign(joy,{id:e.pointerId,x0:e.clientX,y0:e.clientY,x:0,y:0});joyEl.style.display='block';joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';knob.style.transform='';}
  else if(lk.id===null)Object.assign(lk,{id:e.pointerId,x:e.clientX,y:e.clientY});});
addEventListener('pointermove',e=>{
  if(e.pointerId===joy.id){let dx=(e.clientX-joy.x0)/55,dy=(e.clientY-joy.y0)/55;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}joy.x=dx;joy.y=dy;knob.style.transform=`translate(${dx*32}px,${dy*32}px)`;}
  else if(e.pointerId===lk.id){look((e.clientX-lk.x)*1.8,(e.clientY-lk.y)*1.4);lk.x=e.clientX;lk.y=e.clientY;}});
const endP=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';}if(e.pointerId===lk.id)lk.id=null;};
addEventListener('pointerup',endP);addEventListener('pointercancel',endP);
$('btnCar').addEventListener('pointerdown',e=>{e.preventDefault();interact();});
let hornHold=false;const hornBtn=$('btnHorn');hornBtn.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();hornHold=true;});
['pointerup','pointercancel','pointerleave'].forEach(t=>hornBtn.addEventListener(t,()=>{hornHold=false;}));
const runBtn=$('btnRun');runBtn.addEventListener('pointerdown',e=>{e.preventDefault();hold=true;});
['pointerup','pointercancel','pointerleave'].forEach(t=>runBtn.addEventListener(t,()=>{hold=false;}));
function readInput(){
  if(!playing())return{x:0,y:0,run:false,jump:false,horn:false};
  let x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),y=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  if(joy.id!==null){x+=joy.x;y-=joy.y;}
  const touchRun=!player.car&&(hold||Math.hypot(joy.x,joy.y)>0.95);
  return{x:clamp(x,-1,1),y:clamp(y,-1,1),run:!!(keys.ShiftLeft||keys.ShiftRight||touchRun),jump:!!(keys.Space||(player.car&&hold)),horn:!!(keys.Digit2||keys.Numpad2||hornHold)};
}
function showIntro(show){$('intro').classList.toggle('hidden',!show);document.body.classList.toggle('playing',!show);
  if(show&&document.pointerLockElement)document.exitPointerLock();for(const k in keys)keys[k]=false;}
$('go').addEventListener('click',()=>{initAudio();started=true;$('go').textContent='Back to the city';showIntro(false);
  if(!coarse){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(err){}}});
let hq=!coarse;
function applyQuality(){renderer.setPixelRatio(Math.min(devicePixelRatio,hq?1.5:1));renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=hq;sun.castShadow=hq;[facadeMat,propMat,groundMat].forEach(m=>m.needsUpdate=true);}
applyQuality();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
