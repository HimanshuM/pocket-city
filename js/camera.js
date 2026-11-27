/* ---------- camera ---------- */
const camDir=new THREE.Vector3();
function look(mx,my){cam.yaw-=mx*0.0028;cam.pitch=clamp(cam.pitch+my*0.0022,-1.4,1.25);cam.lastLook=performance.now();}
function updateCamera(dt,F,now){
  const c=player.car;
  const sp=c?Math.hypot(c.v,c.vl):0,fast=clamp(sp/34,0,1);
  if(c&&now-cam.lastLook>1200){
    // swing behind the car; during a slide, partly toward the direction of travel so you see the car's side.
    // The faster you go, the quicker it catches up and the lower it sits.
    let want=c.h;
    if(c.v>2){const vx=-Math.sin(c.h)*c.v+Math.cos(c.h)*c.vl,vz=-Math.cos(c.h)*c.v-Math.sin(c.h)*c.vl;want+=wrapA(Math.atan2(-vx,-vz)-c.h)*0.6;}
    cam.yaw+=wrapA(want-cam.yaw)*(1-Math.exp(-dt*(2.5+sp*0.1)));cam.pitch=lerp(cam.pitch,0.26-0.06*fast,1-Math.exp(-dt*2));}
  // pitch > 0 orbits the camera above the player, looking down at them. pitch < 0 looks up: the camera stays
  // behind the player, drops and moves in a little, and tilts its view up by `up`, so the player slides down the screen.
  const up=Math.max(0,-cam.pitch),p=Math.max(0,cam.pitch),ku=Math.min(1,up/1.2);
  const dist=(c?9.5+c.T.cam+Math.abs(c.v)*0.08:5.5)*(1-0.35*ku),ty=F.y+(c?1.6:1.7);
  camDir.set(Math.sin(cam.yaw)*Math.cos(p),Math.sin(p),Math.cos(cam.yaw)*Math.cos(p));
  const boxes=gatherBoxes(F.x,F.z);let d=dist;
  for(let s=1;s<=dist;s+=0.6){const x=F.x+camDir.x*s,y=ty+camDir.y*s,z=F.z+camDir.z*s;
    if(boxes.some(b=>y<b[4]&&x>b[0]-0.3&&x<b[2]+0.3&&z>b[1]-0.3&&z<b[3]+0.3)){d=Math.max(1.2,s-0.6);break;}}
  const tx=F.x+camDir.x*d,tyy=ty+camDir.y*d-0.8*ku,tz=F.z+camDir.z*d,k=1-Math.exp(-dt*12);
  camera.position.set(lerp(camera.position.x,tx,k),Math.max(0.6,lerp(camera.position.y,tyy,k)),lerp(camera.position.z,tz,k));
  if(cam.shake>0){camera.position.x+=(R0()-0.5)*cam.shake*0.5;camera.position.y+=(R0()-0.5)*cam.shake*0.5;cam.shake=Math.max(0,cam.shake-dt*2.5);}
  if(up>0){const hx=F.x-camera.position.x,hz=F.z-camera.position.z,hl=Math.hypot(hx,hz)||1,cu=Math.cos(up)*10/hl;
    camera.lookAt(camera.position.x+hx*cu,camera.position.y+Math.sin(up)*10,camera.position.z+hz*cu);}
  else if(c){const la=clamp(c.v,0,34)*0.12;camera.lookAt(F.x-Math.sin(c.h)*la,ty,F.z-Math.cos(c.h)*la);}  // look a little ahead at speed
  else camera.lookAt(F.x,ty,F.z);
  const fov=62+(c?clamp(Math.abs(c.v)/34,0,1)*10:0);if(Math.abs(camera.fov-fov)>0.05){camera.fov=lerp(camera.fov,fov,0.1);camera.updateProjectionMatrix();}
}
