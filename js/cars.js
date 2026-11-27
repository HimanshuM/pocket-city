/* ---------- cars ---------- */
const traffic=[],freeCars=[],MAXT=30;
function makeCar(col){
  const B=new GB(),L=new GB();
  B.box(0,0.35,0,2,0.7,4.4,col);B.box(0,1.05,0.25,1.75,0.6,2.3,0x26303c);B.box(0,1.65,0.25,1.8,0.09,2.1,col);
  B.box(0,0.3,-2.25,2.02,0.32,0.14,0x34373e);B.box(0,0.3,2.25,2.02,0.32,0.14,0x34373e);
  for(const sx of [-1,1]){L.box(sx*0.65,0.72,-2.22,0.45,0.18,0.06,0xfff1c8);L.box(sx*0.65,0.78,2.22,0.45,0.16,0.06,0xff3030);}
  const obj=new THREE.Group(),rig=new THREE.Group(),body=new THREE.Mesh(B.build(),propMat),lights=new THREE.Mesh(L.build(),carLightMat);
  body.castShadow=true;body.receiveShadow=true;rig.add(body,lights);obj.add(rig);scene.add(obj);
  // spin/wsteer drive the wheels; sy/svy (bounce) and pa/pw (nose up/down) are the body's springs
  return {obj,rig,h:0,v:0,vl:0,steer:0,src:null,spin:0,wsteer:0,sy:0,svy:0,pa:0,pw:0,marks:[null,null]};
}

/* wheels: every car's wheels are drawn together as one instanced mesh, so the whole city's wheels cost one
   draw call. Each frame updateWheels places 4 wheels per nearby car, spinning with speed and steering at the front. */
const WHEEL_R=0.35,WHEELS=[[-0.95,-1.38],[0.95,-1.38],[-0.95,1.38],[0.95,1.38]],WMAX=1024;  // front pair first (cars face -z)
function wheelGeometry(){  // a 12-sided tyre with a 5-sided hubcap (so you can see it turn), axle along x
  const pos=[],nor=[],col=[],idx=[];
  for(const [g,c] of [[new THREE.CylinderGeometry(WHEEL_R,WHEEL_R,0.3,12),0x1c1c20],[new THREE.CylinderGeometry(0.2,0.2,0.34,5),0xb8bdc4]]){
    const base=pos.length/3,cc=new THREE.Color(c);
    pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);
    for(let i=0;i<g.attributes.position.count;i++)col.push(cc.r,cc.g,cc.b);
    for(const i of g.index.array)idx.push(i+base);g.dispose();}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.rotateZ(Math.PI/2);return g;
}
const wheels=new THREE.InstancedMesh(wheelGeometry(),propMat,WMAX);
wheels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);wheels.frustumCulled=false;wheels.castShadow=true;wheels.receiveShadow=true;scene.add(wheels);
const _wm=new THREE.Matrix4(),_wq=new THREE.Quaternion(),_we=new THREE.Euler(0,0,0,'YXZ'),_wp=new THREE.Vector3(),_ws=new THREE.Vector3(1,1,1),_ms=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
/* tyre marks: dark strips laid behind the rear wheels while sliding. One instanced mesh holds the latest
   MARKS strips; when it is full the oldest strip is reused. */
const MARKS=600,tyreMarks=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),
  new THREE.MeshBasicMaterial({color:0x0c0c0c,transparent:true,opacity:0.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4}),MARKS);
tyreMarks.count=0;tyreMarks.frustumCulled=false;scene.add(tyreMarks);let markNext=0;
function layTyreMarks(c,sliding){
  const o=c.obj.position,s=Math.sin(c.h),co=Math.cos(c.h);
  for(let i=0;i<2;i++){const lx=i?0.95:-0.95,x=o.x+lx*co+1.38*s,z=o.z-lx*s+1.38*co,last=c.marks[i];  // rear wheel in world space
    c.marks[i]=sliding?{x,z}:null;if(!sliding||!last)continue;
    const dx=x-last.x,dz=z-last.z,len=Math.hypot(dx,dz);if(len<0.05||len>3)continue;
    _wp.set((x+last.x)/2,groundY(x,z)+0.14,(z+last.z)/2);  // high enough to sit on lawns, plazas and the stadium pitch
    _wq.setFromAxisAngle(_up,Math.atan2(dx,dz));_ms.set(0.26,1,len+0.05);
    tyreMarks.setMatrixAt(markNext,_wm.compose(_wp,_wq,_ms));markNext=(markNext+1)%MARKS;tyreMarks.count=Math.max(tyreMarks.count,markNext||MARKS);}
  tyreMarks.instanceMatrix.needsUpdate=true;
}
function updateWheels(dt,F){
  let n=0;
  const add=c=>{const o=c.obj;if(n>WMAX-4||Math.abs(o.position.x-F.x)>170||Math.abs(o.position.z-F.z)>170)return;  // far cars are hidden by fog anyway
    c.spin=(c.spin-c.v*dt/WHEEL_R)%(Math.PI*2);o.updateMatrix();
    for(let i=0;i<4;i++){_we.set(c.spin,i<2?c.wsteer:0,0);_wq.setFromEuler(_we);_wp.set(WHEELS[i][0],WHEEL_R,WHEELS[i][1]);
      wheels.setMatrixAt(n++,_wm.compose(_wp,_wq,_ws).premultiply(o.matrix));}};
  traffic.forEach(add);freeCars.forEach(add);if(player.car)add(player.car);
  for(const ch of chunks.values())ch.parked.forEach(add);
  wheels.count=n;wheels.instanceMatrix.needsUpdate=true;
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
  const [dx,dz]=c.d,node=[c.node[0]+dx,c.node[1]+dz],nd=pick([[dx,dz],[dx,dz],[-dz,dx],[dz,-dx]].filter(o=>node[1]+o[1]<=COAST_CZ),R0),cx=node[0]*CH,cz=node[1]*CH;
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
    if(dist<(init?25:80)||dist>R*CH||Math.max(node[1],node[1]+d[1])>COAST_CZ)continue;  // no roads into the sea
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
    const h0=c.h;tPose(c);
    // front wheels follow the turn: steering angle from how fast the car is turning
    c.wsteer+=(clamp(Math.atan(wrapA(c.h-h0)/Math.max(dt,1e-4)*2.76/Math.max(c.v,1)),-0.6,0.6)-c.wsteer)*(1-Math.exp(-dt*10));
    if(Math.hypot(q.x-F.x,q.z-F.z)>R*CH+30)spawnTraffic(c,F,false);
  }
  for(let i=freeCars.length-1;i>=0;i--){const c=freeCars[i];if(Math.hypot(c.obj.position.x-F.x,c.obj.position.z-F.z)>460){disposeCar(c);freeCars.splice(i,1);}}
}
