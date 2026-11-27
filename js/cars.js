/* ---------- cars ---------- */
const traffic=[],freeCars=[],MAXT=30;
/* car types. Models face -z, y is the bottom of each box. hw/hl = half width/length (collisions), wr = wheel
   radius, wx/wz = wheel positions, top = top speed in m/s (x 3.6 = km/h), accel/steer/grip = handling,
   pitch = engine sound, cam = extra camera distance. */
const GLASS=0x26303c,BUMP=0x34373e,HEAD=0xfff1c8,TAIL=0xff3030;
function carLights(L,hl,yf,yr,w,hr=0.16){for(const sx of [-1,1]){L.box(sx*w,yf,-hl+0.03,0.42,0.16,0.06,HEAD);L.box(sx*w,yr,hl-0.03,0.42,hr,0.06,TAIL);}}
const CAR_TYPES={
  sedan:{name:'Sedan',top:34,accel:12,steer:1,grip:1,hw:1,hl:2.25,wr:0.35,wx:0.95,wz:1.38,pitch:1,cam:0,build(B,L,col){
    B.box(0,0.35,0,2,0.7,4.4,col);B.box(0,1.05,0.25,1.75,0.6,2.3,GLASS);B.box(0,1.65,0.25,1.8,0.09,2.1,col);
    B.box(0,0.3,-2.25,2.02,0.32,0.14,BUMP);B.box(0,0.3,2.25,2.02,0.32,0.14,BUMP);carLights(L,2.25,0.72,0.78,0.65);}},
  hatch:{name:'Hatchback',top:29.2,accel:11,steer:1.15,grip:1,hw:0.93,hl:1.9,wr:0.32,wx:0.86,wz:1.15,pitch:1.12,cam:-0.5,build(B,L,col){
    B.box(0,0.32,0,1.85,0.68,3.7,col);B.box(0,1,0.35,1.66,0.62,2.3,GLASS);B.box(0,1.6,0.35,1.7,0.08,2.15,col);
    B.box(0,0.28,-1.88,1.87,0.3,0.12,BUMP);B.box(0,0.28,1.88,1.87,0.3,0.12,BUMP);carLights(L,1.9,0.7,0.85,0.6,0.3);}},
  sports:{name:'Sports',top:41,accel:17,steer:1.1,grip:1.25,hw:0.98,hl:2.2,wr:0.34,wx:0.97,wz:1.42,pitch:1.2,cam:0,build(B,L,col){
    B.box(0,0.3,0,1.95,0.5,4.4,col);B.box(0,0.8,0.3,1.55,0.42,1.8,GLASS);B.box(0,1.2,0.3,1.6,0.07,1.6,col);
    B.box(0,0.8,-1.2,0.4,0.012,2,0xf4f4f0);  // bonnet stripe
    for(const sx of [-1,1])B.box(sx*0.6,0.8,1.95,0.1,0.25,0.1,BUMP);B.box(0,1.05,1.95,1.9,0.07,0.45,col);  // spoiler
    B.box(0,0.25,-2.2,1.97,0.25,0.12,BUMP);B.box(0,0.25,2.2,1.97,0.25,0.12,BUMP);carLights(L,2.2,0.62,0.66,0.62,0.12);}},
  van:{name:'Van',top:26.4,accel:7.5,steer:0.85,grip:0.85,hw:1.03,hl:2.5,wr:0.38,wx:0.97,wz:1.75,pitch:0.8,cam:1.5,build(B,L,col){
    B.box(0,0.38,0,2.05,1.95,5,col);B.box(0,1.45,-2.47,1.8,0.65,0.08,GLASS);B.box(0,1.55,-1.6,2.07,0.5,1.4,GLASS);
    B.box(0,0.3,-2.5,2.07,0.35,0.14,BUMP);B.box(0,0.3,2.5,2.07,0.35,0.14,BUMP);carLights(L,2.5,0.85,1.1,0.75,0.45);}},
  pickup:{name:'Pickup',top:30.5,accel:9,steer:0.9,grip:0.95,hw:1.03,hl:2.5,wr:0.38,wx:0.98,wz:1.7,pitch:0.85,cam:1,build(B,L,col){
    B.box(0,0.4,0,2.05,0.75,5,col);B.box(0,1.15,-0.65,1.95,0.78,1.9,col);B.box(0,1.3,-0.65,1.97,0.45,1.5,GLASS);B.box(0,1.3,-1.61,1.7,0.45,0.04,GLASS);
    for(const sx of [-1,1])B.box(sx*0.96,1.15,1.3,0.12,0.42,2.3,col);B.box(0,1.15,2.44,2.05,0.42,0.12,col);B.box(0,1.15,1.3,1.8,0.02,2.3,0x3a3a3a);  // load bed
    B.box(0,0.32,-2.52,2.07,0.36,0.14,0xb8bdc4);B.box(0,0.32,2.52,2.07,0.36,0.14,0xb8bdc4);carLights(L,2.5,0.85,0.95,0.75,0.3);}},
};
const CAR_MIX=['sedan','sedan','sedan','hatch','hatch','hatch','van','van','pickup','pickup','sports'];  // traffic and parked cars
const pickCarType=r=>CAR_MIX[(r()*CAR_MIX.length)|0];
function makeCar(col,type='sedan'){
  const T=CAR_TYPES[type],B=new GB(),L=new GB();T.build(B,L,col);
  const obj=new THREE.Group(),rig=new THREE.Group(),body=new THREE.Mesh(B.build(),propMat),lights=new THREE.Mesh(L.build(),carLightMat);
  body.castShadow=true;body.receiveShadow=true;rig.add(body,lights);obj.add(rig);scene.add(obj);
  // spin/wsteer drive the wheels; sy/svy (bounce) and pa/pw (nose up/down) are the body's springs
  return {T,obj,rig,h:0,v:0,vl:0,steer:0,src:null,spin:0,wsteer:0,sy:0,svy:0,pa:0,pw:0,marks:[null,null]};
}

/* wheels: every car's wheels are drawn together as one instanced mesh, so the whole city's wheels cost one
   draw call. Each frame updateWheels places 4 wheels per nearby car, spinning with speed and steering at the front. */
const WHEEL_R=0.35,WMAX=1024;  // the wheel model's radius; each car type scales it to its own wr
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
  for(let i=0;i<2;i++){const lx=i?c.T.wx:-c.T.wx,x=o.x+lx*co+c.T.wz*s,z=o.z-lx*s+c.T.wz*co,last=c.marks[i];  // rear wheel in world space
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
    const T=c.T,k=T.wr/WHEEL_R;c.spin=(c.spin-c.v*dt/T.wr)%(Math.PI*2);o.updateMatrix();_ws.set(1,k,k);
    for(let i=0;i<4;i++){_we.set(c.spin,i<2?c.wsteer:0,0);_wq.setFromEuler(_we);_wp.set(i%2?T.wx:-T.wx,T.wr,i<2?-T.wz:T.wz);  // front pair first (cars face -z)
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
  // road: lane centre 3 m right of the road's centre line, shifted toward the oncoming lane by c.lo while overtaking
  if(c.mode==='road'){const [dx,dz]=c.d;x=c.node[0]*CH-dz*3+dx*(6+c.s)+dz*c.lo;z=c.node[1]*CH+dx*3+dz*(6+c.s)-dx*c.lo;fx=dx;fz=dz;}
  else{const t=c.t,u=1-t,E=c.E,P=c.P,X=c.X;x=u*u*E.x+2*u*t*P.x+t*t*X.x;z=u*u*E.z+2*u*t*P.z+t*t*X.z;
    fx=2*u*(P.x-E.x)+2*t*(X.x-P.x);fz=2*u*(P.z-E.z)+2*t*(X.z-P.z);}
  c.h=Math.atan2(-fx,-fz)+(c.mode==='road'?Math.atan2(c.lov,Math.max(c.v,1)):0);c.obj.position.set(x,0,z);c.obj.rotation.y=c.h;}  // nose into a lane change
// the curve through junction `node` from direction d to direction nd: a quadratic Bezier E -> P -> X
function turnGeom(node,d,nd){
  const [dx,dz]=d,cx=node[0]*CH,cz=node[1]*CH;
  const E={x:cx-dz*3-dx*6,z:cz+dx*3-dz*6},X={x:cx-nd[1]*3+nd[0]*6,z:cz+nd[0]*3+nd[1]*6};
  const P=(nd[0]===dx&&nd[1]===dz)?{x:(E.x+X.x)/2,z:(E.z+X.z)/2}:{x:cx-dz*3-nd[1]*3,z:cz+dx*3+nd[0]*3};
  let len=0,px=E.x,pz=E.z;for(let i=1;i<=8;i++){const t=i/8,u=1-t,x=u*u*E.x+2*u*t*P.x+t*t*X.x,z=u*u*E.z+2*u*t*P.z+t*t*X.z;len+=Math.hypot(x-px,z-pz);px=x;pz=z;}
  return {E,P,X,len,node};
}
// choose the direction at the next junction as soon as the car enters a street, so its whole path ahead is known
function chooseNext(c){
  const [dx,dz]=c.d,node=[c.node[0]+dx,c.node[1]+dz];
  c.nd=pick([[dx,dz],[dx,dz],[-dz,dx],[dz,-dx]].filter(o=>node[1]+o[1]<=COAST_CZ),R0);c.next=turnGeom(node,c.d,c.nd);
}
function tStartTurn(c){Object.assign(c,c.next,{mode:'turn',t:0,lo:0,loT:0,lov:0});}
// a point on the lane: s metres along the street leaving `node` in direction d, lo metres toward the oncoming lane
function roadPt(node,d,s,lo,out){const [dx,dz]=d;out.x=node[0]*CH-dz*3+dx*(6+s)+dz*lo;out.z=node[1]*CH+dx*3+dz*(6+s)-dx*lo;return out;}
function bzPt(G,t,out){const u=1-t;out.x=u*u*G.E.x+2*u*t*G.P.x+t*t*G.X.x;out.z=u*u*G.E.z+2*u*t*G.P.z+t*t*G.X.z;return out;}
// where the car's centre will be after driving `dist` metres further along its path (street, junction curve, next street)
function pathAhead(c,dist,out){
  let G,t;
  if(c.mode==='road'){const rem=CH-12-c.s;if(dist<=rem)return roadPt(c.node,c.d,c.s+dist,c.lo,out);G=c.next;t=(dist-rem)/G.len;}
  else{G=c;t=c.t+dist/c.len;}
  return t<=1?bzPt(G,t,out):roadPt(G.node,c.nd,(t-1)*G.len,0,out);
}
function spawnTraffic(c,F,init){
  const fx=Math.round(F.x/CH),fz=Math.round(F.z/CH);
  for(let tries=0;tries<20;tries++){
    const node=[fx+((R0()*7)|0)-3,fz+((R0()*7)|0)-3],d=pick([[1,0],[-1,0],[0,1],[0,-1]],R0),s=R0()*(CH-12);
    const x=node[0]*CH-d[1]*3+d[0]*(6+s),z=node[1]*CH+d[0]*3+d[1]*(6+s),dist=Math.hypot(x-F.x,z-F.z);
    if(dist<(init?25:80)||dist>R*CH||Math.max(node[1],node[1]+d[1])>COAST_CZ)continue;  // no roads into the sea
    if(traffic.some(o=>o!==c&&Math.hypot(o.obj.position.x-x,o.obj.position.z-z)<12))continue;
    if(freeCars.some(o=>Math.hypot(o.obj.position.x-x,o.obj.position.z-z)<12)||Math.hypot(player.x-x,player.z-z)<12)continue;  // not on top of a car left in the road, or you
    if(!c){c=makeCar(pick(CAR_COLS,R0),pickCarType(R0));c.src='traffic';traffic.push(c);}
    Object.assign(c,{mode:'road',node,d,s,cruise:8+R0()*4,v:6,stuck:0,ignore:0,lo:0,loT:0,lov:0,held:0});chooseNext(c);tPose(c);return;}
}
// is the oncoming lane free from just behind this car to len metres ahead of it?
function oncomingClear(c,len){
  const q=c.obj.position,[dx,dz]=c.d,ox=q.x+dz*6,oz=q.z-dx*6;  // the spot beside us in the oncoming lane
  const busy=(x,z)=>{const rx=x-ox,rz=z-oz,a=rx*dx+rz*dz;return a>-4&&a<len&&Math.abs(rx*dz-rz*dx)<1.6;};  // 1.6 m: in that lane, not parked at its kerb
  for(const o of traffic)if(o!==c&&busy(o.obj.position.x,o.obj.position.z))return false;
  for(const o of freeCars)if(busy(o.obj.position.x,o.obj.position.z))return false;
  const pc=player.car;return !(pc?busy(pc.obj.position.x,pc.obj.position.z):busy(player.x,player.z));
}
const _near=[],_pa={x:0,z:0};
// the first obstacle along the car's path: [free road ahead of its front bumper, what it is, the object (null = you on foot)]
function firstHit(c,near){
  const clear=c.T.hw*0.85;
  for(let k=1;k<=16;k++){const dist=k*0.9;pathAhead(c,dist,_pa);
    for(let i=0;i<near.length;i+=2){const o=near[i+1];
      if(o?obbDist(_pa.x,_pa.z,o)<clear:Math.hypot(_pa.x-player.x,_pa.z-player.z)<clear+0.5)return [dist-c.T.hl,near[i],o];}}
  return [1e9,null,null];
}
function updateTraffic(dt,F){
  if(traffic.length<MAXT)spawnTraffic(null,F,false);
  const pc=player.car;
  for(const c of traffic){
    const q=c.obj.position;
    // look along the path we're about to drive (including the curve through the next junction) for the first thing
    // in the way: 'you' (you or your car), 'parked' (a car left in the road) or a traffic car. gap = free road ahead
    // of our front bumper. Traffic never drives through traffic, except a car stuck inside a junction behind other
    // traffic (gridlock, once we've been stuck 3.5 s). A car held up by you or a parked car is never driven through.
    const near=_near;near.length=0;const close=o=>Math.abs(o.obj.position.x-q.x)<22&&Math.abs(o.obj.position.z-q.z)<22;
    if(pc)near.push('you',pc);else near.push('you',null);
    for(const o of freeCars)if(close(o))near.push('parked',o);
    for(const o of traffic)if(o!==c&&close(o)&&(c.ignore<=0||o.mode!=='turn'||o.bk!=='car'))near.push(o,o);
    let [gap,blocker,hitObj]=firstHit(c,near);
    // something standing in the junction ahead (you, your car, a car left there): try another way through it
    const still=blocker==='parked'||(blocker==='you'&&(!pc||Math.abs(pc.v)<0.5));
    // (works on the approach, or just after entering the junction, by switching to another exit's curve)
    const turning=c.mode==='turn';
    if(still&&c.v<0.5&&(turning?c.t<0.35:gap+c.T.hl>CH-12-c.s)&&(c.rr=(c.rr||0)+dt)>1){c.rr=0;
      const [dx,dz]=c.d,node=turning?c.node:c.next.node,old=turning?[c.nd,c.E,c.P,c.X,c.len]:[c.nd,c.next];
      for(const nd of [[dx,dz],[-dz,dx],[dz,-dx]])if(node[1]+nd[1]<=COAST_CZ&&(nd[0]!==c.nd[0]||nd[1]!==c.nd[1])){
        const G=turnGeom(node,c.d,nd);c.nd=nd;if(turning){c.E=G.E;c.P=G.P;c.X=G.X;c.len=G.len;}else c.next=G;
        const h=firstHit(c,near);if(h[0]>8||(h[1]&&typeof h[1]==='object')){[gap,blocker,hitObj]=h;break;}
        if(turning)[c.nd,c.E,c.P,c.X,c.len]=old;else[c.nd,c.next]=old;}}
    c.bk=!blocker?null:typeof blocker==='string'?blocker:'car';  // what's holding us up: 'you', 'parked' or 'car'
    let target=gap<1.5?0:gap<8?c.cruise*0.35:c.cruise;
    // a car coming toward us in our lane (one that's overtaking): stop well short so it has room to pull back in
    const o2=typeof blocker==='object'&&blocker;if(o2&&o2.lo>0.5&&Math.cos(o2.h-c.h)<-0.5&&gap<14)target=gap<10?0:c.cruise*0.3;
    // traffic lights: stop at the line on red, and on yellow if there's room to stop (about 6 m/s² of braking)
    c.waitLight=false;
    if(c.mode==='road'){const nx=c.node[0]+c.d[0],nz=c.node[1]+c.d[1];
      if(hasSignals(nx,nz)){const st=signalAt(nx,nz,c.d[0]?1:0),dd=CH-16.2-c.T.hl-c.s;  // distance to the stop line
        const key=nx+','+nz;if(st==='y'&&c.v*c.v/12>=dd&&dd>-0.5)c.goJ=key;  // too close to stop on yellow: commit to going
        // (a car still pulling back into its lane after overtaking finishes that first)
        if(st!=='g'&&dd>-0.5&&c.goJ!==key&&c.lo<0.5&&(st==='r'||c.v*c.v/12<dd)){target=Math.min(target,dd<=0.3?0:Math.sqrt(10*dd));c.waitLight=true;}}}
    // queueing behind a car that waits at a light isn't "stuck", so it never pushes through the queue. Only a real
    // queue counts (same road, same direction), and anything still waiting after 30 s may unstick as a safety net.
    const o=typeof blocker==='object'?blocker:null;c.queued=!!(o&&gap<8&&o.mode==='road'&&c.mode==='road'&&o.d[0]===c.d[0]&&o.d[1]===c.d[1]&&(o.waitLight||o.queued));
    c.wait=c.v<0.3?(c.wait||0)+dt:0;
    if(c.v<0.3&&target===0&&((!c.waitLight&&!c.queued)||c.wait>30))c.stuck+=dt;else c.stuck=0;
    if(c.stuck>3.5){c.ignore=2.5;c.stuck=0;} c.ignore-=dt;
    // overtaking: held up for 1.5 s mid-block by something that isn't moving and isn't traffic (you, your car, a car
    // left in the road), with the oncoming lane clear and room to finish before the junction: swing out, pass, pull in
    c.held=c.mode==='road'&&c.loT===0&&still&&c.v<0.5?c.held+dt:0;
    if(c.held>1.5){c.held=0;
      // pull back in once our rear is past the obstacle's front; that, plus ~4 m to merge, must fit before the stop line
      const q2=hitObj?hitObj.obj.position:player,oa=(q2.x-q.x)*c.d[0]+(q2.z-q.z)*c.d[1],ohl=hitObj?hitObj.T.hl:0.4;
      const end=c.s+oa+ohl+c.T.hl+1,limit=hasSignals(c.node[0]+c.d[0],c.node[1]+c.d[1])?CH-16.2-c.T.hl-4:CH-14;
      if(end<limit&&oncomingClear(c,oa+ohl+70)){c.loT=6;c.passEnd=end;}}
    if(c.loT>0&&c.s>c.passEnd)c.loT=0;
    if(c.mode==='road'){const step=4*dt,dl=clamp(c.loT-c.lo,-step,step);c.lo+=dl;c.lov=dl/Math.max(dt,1e-4);}
    c.v+=clamp(target-c.v,-16*dt,4*dt);
    if(c.mode==='road'){c.s+=c.v*dt;if(c.s>=CH-12){const over=c.s-(CH-12);tStartTurn(c);c.t=over/c.len;}}
    else{c.t+=c.v*dt/c.len;if(c.t>=1){const over=(c.t-1)*c.len;c.d=c.nd;c.mode='road';c.s=over;chooseNext(c);}}
    const h0=c.h;tPose(c);
    // front wheels follow the turn: steering angle from how fast the car is turning
    c.wsteer+=(clamp(Math.atan(wrapA(c.h-h0)/Math.max(dt,1e-4)*2.76/Math.max(c.v,1)),-0.6,0.6)-c.wsteer)*(1-Math.exp(-dt*10));
    if(Math.hypot(q.x-F.x,q.z-F.z)>R*CH+30)spawnTraffic(c,F,false);
  }
  for(let i=freeCars.length-1;i>=0;i--){const c=freeCars[i];if(Math.hypot(c.obj.position.x-F.x,c.obj.position.z-F.z)>460){disposeCar(c);freeCars.splice(i,1);}}
}
