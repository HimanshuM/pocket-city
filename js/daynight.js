/* ---------- day and night ---------- */
let dayT=0.6;
const C={nTop:new THREE.Color(0x050a1f),dTop:new THREE.Color(0x4f9be8),duTop:new THREE.Color(0x6a5a9a),nHor:new THREE.Color(0x18203f),dHor:new THREE.Color(0xbfe3ff),duHor:new THREE.Color(0xff9a62),
  sunD:new THREE.Color(0xfff4e0),sunDu:new THREE.Color(0xff8a4a),moon:new THREE.Color(0x8fa8ff),hN:new THREE.Color(0x4a5a8a),hD:new THREE.Color(0xd6ecff)};
let night=0;
function updateSky(dt,F){
  dayT=(dayT+dt*(keys.KeyT&&playing()?40:1)/DAY_LEN)%1;
  const ang=(dayT-0.25)*Math.PI*2,el=Math.sin(ang),day=smooth(-0.1,0.35,el),dusk=1-smooth(0,0.3,Math.abs(el+0.03));
  night=1-smooth(-0.22,0.02,el);
  const u=skyMat.uniforms;
  u.top.value.copy(C.nTop).lerp(C.dTop,day).lerp(C.duTop,dusk*0.5);
  u.hor.value.copy(C.nHor).lerp(C.dHor,day).lerp(C.duHor,dusk*0.65);
  scene.fog.color.copy(u.hor.value);
  let dx=Math.cos(ang),dy=el,dz=0.4;
  u.sunDir.value.set(dx,dy,dz);u.glow.value.copy(C.sunD).lerp(C.sunDu,dusk).multiplyScalar(smooth(-0.12,0.05,el));
  // the moon rises opposite the sun but stays low in the southern sky (at most ~25 degrees up), so its
  // reflection on the sea stretches toward the horizon like a moonlit path instead of a blob below you
  const hl=Math.hypot(Math.cos(ang),0.4),me=0.12+0.32*smooth(0,0.8,-el),mx=-Math.cos(ang)/hl*Math.cos(me),mz=0.4/hl*Math.cos(me),my=Math.sin(me);
  u.moonDir.value.set(mx,my,mz);u.moonAmt.value=night;
  if(el>-0.05){sun.color.copy(C.sunD).lerp(C.sunDu,dusk);sun.intensity=0.62*smooth(-0.05,0.15,el);}
  else{dx=mx;dy=my;dz=mz;sun.color.copy(C.moon);sun.intensity=0.22*smooth(0.05,0.3,-el);}
  dy=Math.max(dy,0.1);const L=Math.hypot(dx,dy,dz);
  sun.position.set(F.x+dx/L*160,dy/L*160,F.z+dz/L*160);sun.target.position.set(F.x,0,F.z);
  hemi.intensity=0.34+0.08*day;hemi.color.copy(C.hN).lerp(C.hD,day);
  facadeMat.emissiveIntensity=night*1.1;
  glowMat.color.setRGB(lerp(0.55,1,night),lerp(0.53,0.93,night),lerp(0.47,0.7,night));
  carLightMat.color.setScalar(lerp(0.5,1,night));
  starMat.opacity=night;headlight.intensity=player.car?night*2.4:0;
}
