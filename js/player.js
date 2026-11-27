/* ---------- player ---------- */
const player={x:40,z:66,y:0.2,vy:0,h:0,car:null,man:makePerson(0xff7a45,0x2d3a55,0xe8b996,0x2b1d14)};
const headlight=new THREE.SpotLight(0xfff2cc,0,70,0.55,0.5,1.2);headlight.position.set(0,1,-2.3);headlight.target.position.set(0,0,-20);scene.add(headlight,headlight.target);
const cam={yaw:0,pitch:0.32,lastLook:0,shake:0};
function walk(dt,inp){
  const p=player,sy=Math.sin(cam.yaw),cy=Math.cos(cam.yaw);
  let mx=-sy*inp.y+cy*inp.x,mz=-cy*inp.y-sy*inp.x;const m=Math.hypot(mx,mz),sp=(inp.run?7.5:3.4)*Math.min(1,m);
  if(m>0.01){mx/=m;mz/=m;p.h+=wrapA(Math.atan2(-mx,-mz)-p.h)*(1-Math.exp(-dt*12));}
  const t={x:p.x+mx*sp*dt,z:p.z+mz*sp*dt};
  pushBoxes(t,0.4,gatherBoxes(t.x,t.z));for(const c of nearCars(t.x,t.z,6))pushCarOBB(t,0.4,c);
  const moved=Math.hypot(t.x-p.x,t.z-p.z)/Math.max(dt,1e-4);p.x=t.x;p.z=t.z;
  const gy=groundY(p.x,p.z);if(inp.jump&&p.y<=gy+0.01)p.vy=6.5;
  p.vy-=20*dt;p.y+=p.vy*dt;if(p.y<=gy){p.y=gy;p.vy=0;}
  p.man.g.position.set(p.x,p.y,p.z);p.man.g.rotation.y=p.h;animPerson(p.man,p.y>gy+0.05?0:moved,dt);
}
function carCollide(c){
  const pos=c.obj.position,s=Math.sin(c.h),co=Math.cos(c.h),boxes=gatherBoxes(pos.x,pos.z),cars=nearCars(pos.x,pos.z,8);let tx=0,tz=0;
  for(const o of [-1.45,0,1.45]){const t={x:pos.x+s*o,z:pos.z+co*o},bx=t.x,bz=t.z;
    pushBoxes(t,1.05,boxes);for(const oc of cars)pushCarOBB(t,1.05,oc);
    const dx=t.x-bx,dz=t.z-bz;pos.x+=dx;pos.z+=dz;tx+=dx;tz+=dz;}
  return [tx,tz];}
function drive(dt,inp){
  const c=player.car,th=inp.y,st=-inp.x;
  if(th>0)c.v+=(c.v<0?24:12)*th*dt;else if(th<0)c.v-=(c.v>0.5?26:7)*(-th)*dt;else c.v-=c.v*0.5*dt;
  if(inp.jump)c.v*=Math.exp(-2.2*dt);
  c.v-=c.v*Math.abs(c.v)*0.006*dt;c.v=clamp(c.v,-9,34);
  c.steer+=(st-c.steer)*(1-Math.exp(-dt*8));
  const sp=Math.abs(c.v),turn=c.steer*1.9*Math.min(1,sp/6)*(1-0.5*Math.min(1,sp/34))*Math.sign(c.v)*(inp.jump?1.5:1);
  c.h+=turn*dt;const fx=-Math.sin(c.h),fz=-Math.cos(c.h),pos=c.obj.position;
  pos.x+=fx*c.v*dt;pos.z+=fz*c.v*dt;
  const [hx,hz]=carCollide(c);
  if(hx||hz){const n=Math.hypot(hx,hz),into=(fx*hx+fz*hz)/n*c.v;if(into<-2){c.v*=-0.25;cam.shake=Math.min(1,-into/15);}else c.v*=0.96;}
  pos.y+=(groundY(pos.x,pos.z)-pos.y)*(1-Math.exp(-dt*12));c.obj.rotation.y=c.h;
  c.rig.rotation.z+=(clamp(turn*c.v*0.01,-0.07,0.07)-c.rig.rotation.z)*(1-Math.exp(-dt*6));
  player.x=pos.x;player.z=pos.z;player.y=pos.y;
}
function interact(){
  if(!playing())return;const p=player;
  if(p.car){const c=p.car,pos=c.obj.position,co=Math.cos(c.h),s=Math.sin(c.h);
    for(const side of [-1,1]){const t={x:pos.x+side*co*2.2,z:pos.z-side*s*2.2};
      const blocked=gatherBoxes(t.x,t.z).some(b=>t.x>b[0]-0.4&&t.x<b[2]+0.4&&t.z>b[1]-0.4&&t.z<b[3]+0.4);
      if(!blocked||side===1){p.x=t.x;p.z=t.z;break;}}
    c.v=0;c.steer=0;c.rig.rotation.z=0;c.src='free';freeCars.push(c);scene.add(headlight,headlight.target);headlight.intensity=0;
    p.car=null;p.h=c.h;p.y=groundY(p.x,p.z);p.man.g.visible=true;p.man.g.position.set(p.x,p.y,p.z);return;}
  let best=null,bd=1.8;for(const c of nearCars(p.x,p.z,7)){const d=obbDist(p.x,p.z,c);if(d<bd){bd=d;best=c;}}
  if(!best)return;detach(best);p.car=best;best.obj.add(headlight,headlight.target);p.man.g.visible=false;cam.lastLook=0;
}
