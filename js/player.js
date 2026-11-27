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
  const e=c.T.hl-0.8,rad=c.T.hw+0.05;  // three circles along the car's length
  for(const o of [-e,0,e]){const t={x:pos.x+s*o,z:pos.z+co*o},bx=t.x,bz=t.z;
    pushBoxes(t,rad,boxes);for(const oc of cars)pushCarOBB(t,rad,oc);
    const dx=t.x-bx,dz=t.z-bz;pos.x+=dx;pos.z+=dz;tx+=dx;tz+=dz;}
  return [tx,tz];}
function drive(dt,inp){
  const c=player.car,T=c.T,th=inp.y,st=-inp.x,v0=c.v,hb=inp.jump;
  // each type accelerates at its own rate, fading out as it nears its own top speed
  if(th>0)c.v+=(c.v<0?24:T.accel*(1-Math.pow(clamp(c.v/T.top,0,1),4)))*th*dt;else if(th<0)c.v-=(c.v>0.5?26:7)*(-th)*dt;else c.v-=c.v*0.5*dt;
  if(hb)c.v*=Math.exp(-1.2*dt);  // handbrake: slows you, but mostly makes the back slide
  if(th<=0)c.v-=c.v*Math.abs(c.v)*0.006*dt;  // air drag when coasting; on the throttle the fade above sets the top speed
  c.v=clamp(c.v,-9,T.top);
  c.steer+=(st-c.steer)*(1-Math.exp(-dt*8));c.wsteer=c.steer*0.55;
  const sp=Math.abs(c.v),turn=c.steer*1.9*T.steer*Math.min(1,sp/6)*(1-0.5*Math.min(1,sp/34))*Math.sign(c.v)*(hb?1.7:1);
  // drift: the car keeps its momentum when it turns, so it picks up sideways speed (vl, + = to the right),
  // and tyre grip removes it over time. Grip drops at high speed and a lot with the handbrake, so the back slides.
  let Vx=-Math.sin(c.h)*c.v+Math.cos(c.h)*c.vl,Vz=-Math.cos(c.h)*c.v-Math.sin(c.h)*c.vl;
  c.h+=turn*dt;const fx=-Math.sin(c.h),fz=-Math.cos(c.h),rx=-fz,rz=fx,pos=c.obj.position;
  c.v=Vx*fx+Vz*fz;c.vl=Vx*rx+Vz*rz;
  c.vl*=Math.exp(-(hb?1.1:lerp(9,3.5,clamp((sp-14)/20,0,1)))*T.grip*dt);
  pos.x+=(fx*c.v+rx*c.vl)*dt;pos.z+=(fz*c.v+rz*c.vl)*dt;
  const [hx,hz]=carCollide(c);
  if(hx||hz){const n=Math.hypot(hx,hz),nx=hx/n,nz=hz/n;Vx=fx*c.v+rx*c.vl;Vz=fz*c.v+rz*c.vl;const vn=Vx*nx+Vz*nz;
    if(vn<-2){Vx-=nx*vn*1.25;Vz-=nz*vn*1.25;cam.shake=Math.min(1,-vn/15);carThud(cam.shake);}  // hit: bounce off a little
    else{if(vn<0){Vx-=nx*vn;Vz-=nz*vn;}Vx*=0.96;Vz*=0.96;}  // scrape: slide along it
    c.v=Vx*fx+Vz*fz;c.vl=Vx*rx+Vz*rz;}
  layTyreMarks(c,Math.abs(c.vl)>2.5||(hb&&sp>6));
  // suspension: the wheels follow the ground at once and the body lags on springs, so kerbs make it bob;
  // the nose lifts when you accelerate and dips when you brake, and the body leans in turns
  const g=groundY(pos.x,pos.z);c.sy-=g-pos.y;pos.y=g;c.obj.rotation.y=c.h;
  c.svy+=(-160*c.sy-10*c.svy)*dt;c.sy=clamp(c.sy+c.svy*dt,-0.25,0.25);
  const pitch=clamp((c.v-v0)/Math.max(dt,1e-4)*0.004,-0.06,0.045);
  c.pw+=(-90*(c.pa-pitch)-9*c.pw)*dt;c.pa+=c.pw*dt;
  c.rig.position.y=c.sy;c.rig.rotation.x=c.pa;
  c.rig.rotation.z+=(clamp(turn*c.v*0.01,-0.07,0.07)-c.rig.rotation.z)*(1-Math.exp(-dt*6));
  player.x=pos.x;player.z=pos.z;player.y=pos.y;
}
function interact(){
  if(!playing())return;const p=player;
  if(p.car){const c=p.car,pos=c.obj.position,co=Math.cos(c.h),s=Math.sin(c.h);
    for(const side of [-1,1]){const t={x:pos.x+side*co*(c.T.hw+1.2),z:pos.z-side*s*(c.T.hw+1.2)};
      const blocked=gatherBoxes(t.x,t.z).some(b=>t.x>b[0]-0.4&&t.x<b[2]+0.4&&t.z>b[1]-0.4&&t.z<b[3]+0.4);
      if(!blocked||side===1){p.x=t.x;p.z=t.z;break;}}
    c.v=c.vl=0;c.steer=0;c.sy=c.svy=c.pa=c.pw=0;c.rig.position.y=0;c.rig.rotation.set(0,0,0);c.src='free';freeCars.push(c);scene.add(headlight,headlight.target);headlight.intensity=0;
    carThud(0.12);p.car=null;p.h=c.h;p.y=groundY(p.x,p.z);p.man.g.visible=true;p.man.g.position.set(p.x,p.y,p.z);return;}
  let best=null,bd=1.8;for(const c of nearCars(p.x,p.z,7)){const d=obbDist(p.x,p.z,c);if(d<bd){bd=d;best=c;}}
  if(!best)return;carThud(0.12);detach(best);p.car=best;headlight.position.set(0,1,-best.T.hl);best.obj.add(headlight,headlight.target);p.man.g.visible=false;cam.lastLook=0;
}
