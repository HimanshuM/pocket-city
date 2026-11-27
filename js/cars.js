/* ---------- cars ---------- */
const traffic=[],freeCars=[],MAXT=30;
function makeCar(col){
  const B=new GB(),L=new GB();
  B.box(0,0.35,0,2,0.7,4.4,col);B.box(0,1.05,0.25,1.75,0.6,2.3,0x26303c);B.box(0,1.65,0.25,1.8,0.09,2.1,col);
  for(const sx of [-1,1])for(const sz of [-1,1])B.box(sx*0.95,0,sz*1.38,0.42,0.7,0.76,0x1c1c20);
  B.box(0,0.3,-2.25,2.02,0.32,0.14,0x34373e);B.box(0,0.3,2.25,2.02,0.32,0.14,0x34373e);
  for(const sx of [-1,1]){L.box(sx*0.65,0.72,-2.22,0.45,0.18,0.06,0xfff1c8);L.box(sx*0.65,0.78,2.22,0.45,0.16,0.06,0xff3030);}
  const obj=new THREE.Group(),rig=new THREE.Group(),body=new THREE.Mesh(B.build(),propMat),lights=new THREE.Mesh(L.build(),carLightMat);
  body.castShadow=true;body.receiveShadow=true;rig.add(body,lights);obj.add(rig);scene.add(obj);
  return {obj,rig,h:0,v:0,steer:0,src:null};
}
function placeCar(c,x,z,h){c.obj.position.set(x,groundY(x,z),z);c.h=h;c.obj.rotation.y=h;}
function disposeCar(c){scene.remove(c.obj);c.rig.children.forEach(m=>m.geometry.dispose());}
function detach(c){
  if(c.src==='traffic')traffic.splice(traffic.indexOf(c),1);
  else if(c.src==='free')freeCars.splice(freeCars.indexOf(c),1);
  else if(c.src&&c.src.parked)c.src.parked.splice(c.src.parked.indexOf(c),1);
  c.src=null;}

/* traffic: cars follow lanes on the road grid and pick a turn at every junction */
function tPose(c){
  let x,z,fx,fz;
  if(c.mode==='road'){const [dx,dz]=c.d;x=c.node[0]*CH-dz*3+dx*(6+c.s);z=c.node[1]*CH+dx*3+dz*(6+c.s);fx=dx;fz=dz;}
  else{const t=c.t,u=1-t,E=c.E,P=c.P,X=c.X;x=u*u*E.x+2*u*t*P.x+t*t*X.x;z=u*u*E.z+2*u*t*P.z+t*t*X.z;
    fx=2*u*(P.x-E.x)+2*t*(X.x-P.x);fz=2*u*(P.z-E.z)+2*t*(X.z-P.z);}
  c.h=Math.atan2(-fx,-fz);c.obj.position.set(x,0,z);c.obj.rotation.y=c.h;}
function tStartTurn(c){
  const [dx,dz]=c.d,node=[c.node[0]+dx,c.node[1]+dz],nd=pick([[dx,dz],[dx,dz],[-dz,dx],[dz,-dx]],R0),cx=node[0]*CH,cz=node[1]*CH;
  const E={x:cx-dz*3-dx*6,z:cz+dx*3-dz*6},X={x:cx-nd[1]*3+nd[0]*6,z:cz+nd[0]*3+nd[1]*6};
  const P=(nd[0]===dx&&nd[1]===dz)?{x:(E.x+X.x)/2,z:(E.z+X.z)/2}:{x:cx-dz*3-nd[1]*3,z:cz+dx*3+nd[0]*3};
  Object.assign(c,{mode:'turn',E,P,X,t:0,node,nd});
  let len=0,px=E.x,pz=E.z;for(let i=1;i<=8;i++){const t=i/8,u=1-t,x=u*u*E.x+2*u*t*P.x+t*t*X.x,z=u*u*E.z+2*u*t*P.z+t*t*X.z;len+=Math.hypot(x-px,z-pz);px=x;pz=z;}
  c.len=len;}
function spawnTraffic(c,F,init){
  const fx=Math.round(F.x/CH),fz=Math.round(F.z/CH);
  for(let tries=0;tries<20;tries++){
    const node=[fx+((R0()*7)|0)-3,fz+((R0()*7)|0)-3],d=pick([[1,0],[-1,0],[0,1],[0,-1]],R0),s=R0()*(CH-12);
    const x=node[0]*CH-d[1]*3+d[0]*(6+s),z=node[1]*CH+d[0]*3+d[1]*(6+s),dist=Math.hypot(x-F.x,z-F.z);
    if(dist<(init?25:80)||dist>R*CH)continue;
    if(traffic.some(o=>o!==c&&Math.hypot(o.obj.position.x-x,o.obj.position.z-z)<12))continue;
    if(!c){c=makeCar(pick(CAR_COLS,R0));c.src='traffic';traffic.push(c);}
    Object.assign(c,{mode:'road',node,d,s,cruise:8+R0()*4,v:6,stuck:0,ignore:0});tPose(c);return;}
}
function updateTraffic(dt,F){
  if(traffic.length<MAXT)spawnTraffic(null,F,false);
  const pc=player.car;
  for(const c of traffic){
    const q=c.obj.position,fx=-Math.sin(c.h),fz=-Math.cos(c.h);let block=1e9;
    const test=(ox,oz)=>{const rx=ox-q.x,rz=oz-q.z,a=rx*fx+rz*fz;if(a<=0.5||a>13)return;if(Math.abs(rx*-fz+rz*fx)<2.3)block=Math.min(block,a);};
    if(pc)test(pc.obj.position.x,pc.obj.position.z);else test(player.x,player.z);
    for(const o of freeCars)test(o.obj.position.x,o.obj.position.z);
    if(c.ignore<=0)for(const o of traffic)if(o!==c&&Math.abs(o.obj.position.x-q.x)<14&&Math.abs(o.obj.position.z-q.z)<14)test(o.obj.position.x,o.obj.position.z);
    const target=block<6.5?0:block<13?c.cruise*0.35:c.cruise;
    if(c.v<0.3&&target===0)c.stuck+=dt;else c.stuck=0;
    if(c.stuck>3.5){c.ignore=2.5;c.stuck=0;} c.ignore-=dt;
    c.v+=clamp(target-c.v,-16*dt,4*dt);
    if(c.mode==='road'){c.s+=c.v*dt;if(c.s>=CH-12){const over=c.s-(CH-12);tStartTurn(c);c.t=over/c.len;}}
    else{c.t+=c.v*dt/c.len;if(c.t>=1){const over=(c.t-1)*c.len;c.d=c.nd;c.mode='road';c.s=over;}}
    tPose(c);
    if(Math.hypot(q.x-F.x,q.z-F.z)>R*CH+30)spawnTraffic(c,F,false);
  }
  for(let i=freeCars.length-1;i>=0;i--){const c=freeCars[i];if(Math.hypot(c.obj.position.x-F.x,c.obj.position.z-F.z)>460){disposeCar(c);freeCars.splice(i,1);}}
}
