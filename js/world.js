/* ---------- chunks: the streamed world ---------- */
// Hand-built blocks override the generator. Add your own: CUSTOM['x,z'] = k => { ... }
const CUSTOM={'0,0':townSquare};
const chunks=new Map();
const groundY=(x,z)=>{const lx=((x%CH)+CH)%CH-HALF,lz=((z%CH)+CH)%CH-HALF;return(Math.abs(lx)<LOT&&Math.abs(lz)<LOT)?0.2:0;};
function solid(k,lx,lz,hx,hz,h){k.boxes.push([k.ox+lx-hx,k.oz+lz-hz,k.ox+lx+hx,k.oz+lz+hz,h]);}
function tree(k,lx,lz,s=1){const g=pick(GREENS,k.r);
  k.P.box(lx,0.2,lz,0.45*s,2.3*s,0.45*s,0x6b4a2f);k.P.box(lx,0.2+2*s,lz,2.6*s,1.9*s,2.6*s,g);k.P.box(lx,0.2+3.7*s,lz,1.7*s,1.3*s,1.7*s,shade(g,1.15));
  solid(k,lx,lz,0.3*s,0.3*s,5*s);}
function lamp(k,lx,lz){k.P.box(lx,0.2,lz,0.22,6.2,0.22,0x3e444c);k.P.box(lx,6.35,lz,0.9,0.14,0.9,0x3e444c);k.G.box(lx,6.1,lz,0.62,0.25,0.62,0xffffff);solid(k,lx,lz,0.2,0.2,6.5);}
function bench(k,x,z,alongX){k.P.box(x,0.25,z,alongX?2.4:0.7,0.5,alongX?0.7:2.4,0x8a5a3a);}
function city(k,dt){
  const {B,P,r}=k,nx=r()<0.5?2:3,nz=r()<0.5?2:3,gap=2.5,pw=(BLD*2-(nx-1)*gap)/nx,pd=(BLD*2-(nz-1)*gap)/nz;
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
    const px=-BLD+pw/2+i*(pw+gap),pz=-BLD+pd/2+j*(pd+gap),roll=r();
    if(roll<0.08){P.box(px,0.2,pz,pw,0.06,pd,0x7cb860);tree(k,px,pz);continue;}
    if(roll<0.15){P.box(px,0.2,pz,pw,0.03,pd,0x55585f);for(let s=-1;s<=1;s+=2)P.box(px+s*pw*0.2,0.23,pz,0.15,0.01,pd*0.8,0xe8e8e8);continue;}
    const w=pw-0.5-r()*2.5,d=pd-0.5-r()*2.5,floors=Math.max(2,Math.round((2+r()*5)*dt*(0.55+r()*0.9))),h=floors*3.5,col=pick(BCOLS,r);
    B.box(px,0.2,pz,w,h,d,col,true);P.box(px,0.2+h,pz,w+0.3,0.45,d+0.3,shade(col,0.82));solid(k,px,pz,w/2,d/2,h+0.65);
    let top=h+0.65;
    if(floors>9&&r()<0.65){const w2=w*(0.45+r()*0.25),d2=d*(0.45+r()*0.25),f2=Math.max(2,Math.round(floors*(0.25+r()*0.35)));
      B.box(px,top,pz,w2,f2*3.5,d2,shade(col,1.06),true);top+=f2*3.5;P.box(px,top,pz,w2+0.3,0.4,d2+0.3,shade(col,0.82));top+=0.4;k.boxes[k.boxes.length-1][4]=top;}
    if(r()<0.55)P.box(px+(r()-0.5)*w*0.3,top,pz+(r()-0.5)*d*0.3,1.5+r()*2,1.1,1.5+r()*2,0x9aa1aa);
    if(r()<0.6){const ac=pick(AWN,r);
      if(i===0)P.box(px-w/2-0.6,3.3,pz,1.2,0.18,d*0.7,ac); if(i===nx-1)P.box(px+w/2+0.6,3.3,pz,1.2,0.18,d*0.7,ac);
      if(j===0)P.box(px,3.3,pz-d/2-0.6,w*0.7,0.18,1.2,ac); if(j===nz-1)P.box(px,3.3,pz+d/2+0.6,w*0.7,0.18,1.2,ac);}
  }
  for(const t of [-21,-7,7,21]){ if(r()<0.5)tree(k,33,t,0.8); if(r()<0.5)tree(k,-33,t,0.8); if(r()<0.5)tree(k,t,33,0.8); if(r()<0.5)tree(k,t,-33,0.8); }
}
function park(k){
  const {P,r}=k;
  P.box(0,0.2,0,LOT*2-2,0.08,LOT*2-2,0x74b55c);
  P.box(0,0.28,0,3.2,0.02,LOT*2-2,0xdccfae);P.box(0,0.28,0,LOT*2-2,0.02,3.2,0xdccfae);
  const qx=r()<0.5?-1:1,qz=r()<0.5?-1:1,wx=qx*16,wz=qz*16;
  P.box(wx,0.2,wz,17,0.1,12,0xb9ad93);P.box(wx,0.27,wz,16,0.04,11,0x4aa3cf);
  for(let n=0;n<18;n++){const x=(r()*2-1)*28,z=(r()*2-1)*28;
    if(Math.abs(x)<4||Math.abs(z)<4||(Math.abs(x-wx)<10&&Math.abs(z-wz)<7.5))continue; tree(k,x,z,0.8+r()*0.5);}
  bench(k,3,10,false);bench(k,-3,-12,false);bench(k,10,3,true);bench(k,-14,-3,true);
}
function townSquare(k){
  const {B,P}=k;
  P.box(0,0.2,0,62,0.05,62,0xd9cdb6);P.box(0,0.22,0,24,0.05,24,0xc9b593);
  P.box(0,0.25,0,10,0.6,10,0xcfc7b8);P.box(0,0.83,0,8.6,0.06,8.6,0x4fb0d9);
  P.box(0,0.85,0,1.4,2.8,1.4,0xcfc7b8);P.box(0,3.6,0,3.4,0.35,3.4,0xcfc7b8);P.box(0,3.93,0,2.8,0.05,2.8,0x4fb0d9);
  solid(k,0,0,5,5,4);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;tree(k,Math.cos(a)*17,Math.sin(a)*17,1.1);}
  bench(k,0,9,true);bench(k,0,-9,true);bench(k,9,0,false);bench(k,-9,0,false);
  const cafe=[0xf0c987,0xd99a6c,0xc9d6df,0xe6b8a2];let n=0;
  for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*23,z=sz*23;
    B.box(x,0.2,z,12,7,12,cafe[n],true);P.box(x,7.2,z,12.4,0.5,12.4,shade(cafe[n],0.8));solid(k,x,z,6,6,7.7);
    P.box(x-sx*6.6,3.3,z,1.2,0.18,9,AWN[n]);P.box(x,3.3,z-sz*6.6,9,0.18,1.2,AWN[n]);n++;}
}
/* districts: the map is split into irregular regions of roughly 4x4 blocks, each with its own kind of block */
const DCELL=4;
function districtAt(cx,cz){
  if(Math.hypot(cx+0.5,cz+0.5)<2.6)return 'downtown';
  const gx=Math.floor(cx/DCELL),gz=Math.floor(cz/DCELL);let best=1e9,type='city';
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){  // nearest random centre point wins
    const r=rng(hash2(gx+i+7777,gz+j-7777)),px=(gx+i+r())*DCELL,pz=(gz+j+r())*DCELL,roll=r(),d=Math.hypot(px-cx-0.5,pz-cz-0.5);
    if(d<best){best=d;type=roll<0.45?'residential':roll<0.7?'industrial':'city';}}
  if(type==='industrial'&&Math.hypot(cx,cz)<5)type='city';  // keep factories away from the centre
  return type;
}
function residential(k){
  const {B,P,r}=k,pw=20;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
    const px=i*pw,pz=j*pw;
    if(!i&&!j){  // shared garden with a pool in the middle of the block
      P.box(0,0.2,0,pw-0.8,0.06,pw-0.8,0x6aab4f);P.box(0,0.2,0,8,0.1,5,0xb9ad93);P.box(0,0.27,0,7,0.04,4,0x4aa3cf);
      for(const sx of [-1,1])for(const sz of [-1,1])tree(k,sx*6.5,sz*6.5,0.9+r()*0.3);
      continue;}
    // each house faces its nearest street. In plot coordinates a points toward the street and b sideways.
    const fx=j?0:i,fz=j,ax=!!fz,at=(a,b)=>[px+fx*a+(ax?b:0),pz+fz*a+(ax?0:b)],dims=(la,ld)=>ax?[la,ld]:[ld,la];
    const pbox=(a,y,b,la,h,ld,col)=>{const [x,z]=at(a,b),[sx,sz]=dims(la,ld);P.box(x,y,z,sx,h,sz,col);return [x,z,sx,sz];};
    P.box(px,0.2,pz,pw-0.8,0.06,pw-0.8,pick(GREENS,r));
    const w=8+r()*3,d=7+r()*2,h=(r()<0.55?2:1)*3.5,rh=2+r()*1.2,col=pick(HOUSE_COLS,r),[hx,hz]=at(-2,0),[sx,sz]=dims(w,d);
    B.box(hx,0.2,hz,sx,h,sz,col,true);P.roof(hx,0.2+h,hz,sx+0.8,rh,sz+0.8,pick(ROOF_COLS,r),ax,col);solid(k,hx,hz,sx/2,sz/2,0.2+h+rh);
    pbox(d/2-1.95,0.2,0,1.2,2.3,0.12,0x6b4a2f);  // front door
    const db=(r()<0.5?-1:1)*(w/2+1.8),front=d/2-2;
    pbox(3.8,0.2,db,3,0.08,11.6,0x8e8a84);  // driveway
    pbox((front+9.6)/2,0.2,0,1.2,0.08,9.6-front,0xcfc7b8);  // front path
    // low white fence along the street, with gaps for the path and the driveway
    let b0=-9.6;
    for(const [g0,g1] of [[-0.9,0.9],[db-1.7,db+1.7]].sort((p,q)=>p[0]-q[0]).concat([[9.6,9.6]])){
      if(g0-b0>0.3){const [x,z,fsx,fsz]=pbox(9.4,0.2,(b0+g0)/2,g0-b0,0.9,0.12,0xf4f1ea);solid(k,x,z,fsx/2,fsz/2,1.1);}b0=g1;}
    for(const s of [-1,1])if(r()<0.6)tree(k,...at(-8.2,s*7.5),0.8+r()*0.3);
    if(r()<0.25){const [x,z]=at(4.5,db),c=makeCar(pick(CAR_COLS,r));placeCar(c,k.ox+x,k.oz+z,Math.atan2(fx,fz));k.cars.push(c);}
  }
  for(const t of [-21,-7,7,21]){ if(r()<0.7)tree(k,33,t,0.8); if(r()<0.7)tree(k,-33,t,0.8); if(r()<0.7)tree(k,t,33,0.8); if(r()<0.7)tree(k,t,-33,0.8); }
}
function fence(k,x,z,len,alongX){  // posts and rails; solid, so you go in through the gates
  const {P}=k,n=Math.max(1,Math.round(len/2.5));
  for(let i=0;i<=n;i++){const t=-len/2+i*len/n;P.box(alongX?x+t:x,0.2,alongX?z:z+t,0.12,2.2,0.12,0x6f757c);}
  for(const y of [0.4,1.3,2.2])P.box(x,0.2+y-0.03,z,alongX?len:0.06,0.06,alongX?0.06:len,0x8a9098);
  solid(k,x,z,alongX?len/2:0.1,alongX?0.1:len/2,2.4);
}
function industrial(k){
  const {B,P,r}=k;
  P.box(0,0.2,0,60,0.04,60,0x63666d);  // asphalt yard
  for(const s of [-1,1])for(const half of [-1,1]){fence(k,half*17.75,s*30.5,25.5,true);fence(k,s*30.5,half*17.75,25.5,false);}
  // warehouse along one side, with an office at one end and roller doors facing the yard
  const sx=r()<0.5?-1:1,ww=26+r()*6,wd=36+r()*10,wh=7+r()*4,col=pick(IND_COLS,r);
  const wx=sx*(28-ww/2),wz=(r()-0.5)*(48-wd)+4,az=wz-wd/2-4,aw=Math.min(ww-4,12);
  P.box(wx,0.2,wz,ww,wh,wd,col);P.box(wx,0.2+wh*0.55,wz,ww+0.08,0.5,wd+0.08,shade(col,0.8));P.box(wx,0.2+wh,wz,ww+0.2,0.35,wd+0.2,shade(col,0.75));
  solid(k,wx,wz,ww/2,wd/2,wh+0.55);
  for(let n=0;n<3;n++)P.box(wx+(r()-0.5)*ww*0.6,0.55+wh,wz+(r()-0.5)*wd*0.7,2,1,2,0x9aa1aa);
  const doors=Math.floor(wd/9);
  for(let n=0;n<doors;n++)P.box(wx-sx*(ww/2+0.06),0.2,wz-wd/2+(n+0.5)*wd/doors,0.12,4.4,4.2,0x50565e);
  B.box(wx,0.2,az,aw,7,8,0xd9d4c7,true);P.box(wx,7.2,az,aw+0.3,0.4,8.3,0x9a958a);solid(k,wx,az,aw/2,4,7.6);
  if(r()<0.5){const x=wx+sx*(ww/2-3),z=wz+wd/2-3,H=16+r()*8;  // chimney with red bands
    P.box(x,0.2,z,1.8,H,1.8,0xb8b2a8);P.box(x,H-2.8,z,1.9,1.2,1.9,0xc0392b);P.box(x,H-6,z,1.9,1.2,1.9,0xc0392b);solid(k,x,z,0.9,0.9,H+0.2);}
  // shipping containers stacked 1-3 high on the other side
  for(let c=0;c<4;c++)for(let row=0;row<7;row++){if(r()<0.2)continue;
    const x=-sx*(26.5-c*3.1),z=-21+row*7,n=1+(r()*3|0);
    for(let s=0;s<n;s++)P.box(x,0.2+s*2.6,z,2.44,2.6,6.1,pick(CONT_COLS,r));solid(k,x,z,1.22,3.05,0.2+n*2.6);}
  if(r()<0.7){const zs=r()<0.5?-1:1;  // two silos
    for(const z of [zs*21,zs*15.5]){const x=-sx*11;
      P.box(x,0.2,z,4.5,10,4.5,0xd5d8dc);for(const y of [3,6.5])P.box(x,0.2+y,z,4.6,0.35,4.6,0xaab0b7);P.box(x,10.2,z,3,0.6,3,0xaab0b7);solid(k,x,z,2.25,2.25,10.8);}}
}
function meshOf(gb,mat,cast){if(!gb.i.length)return null;const m=new THREE.Mesh(gb.build(),mat);m.castShadow=cast;m.receiveShadow=true;return m;}
function makeChunk(cx,cz){
  const key=cx+','+cz,r=rng(hash2(cx,cz)),ox=(cx+0.5)*CH,oz=(cz+0.5)*CH;
  const k={B:new GB(),P:new GB(),G:new GB(),boxes:[],cars:[],ox,oz,r,type:'city'},P=k.P;
  P.box(0,0,0,LOT*2,0.2,LOT*2,0xb9b2a5);
  P.box(0,0,LOT-0.15,LOT*2,0.24,0.3,0x8f897e);P.box(0,0,-LOT+0.15,LOT*2,0.24,0.3,0x8f897e);
  P.box(LOT-0.15,0,0,0.3,0.24,LOT*2,0x8f897e);P.box(-LOT+0.15,0,0,0.3,0.24,LOT*2,0x8f897e);
  const custom=CUSTOM[key];
  const dist=districtAt(cx,cz);
  if(custom){k.type='custom';custom(k);}
  else if(dist!=='industrial'&&r()<(dist==='residential'?0.1:0.13)){k.type='park';park(k);}
  else if(dist==='residential'){k.type='residential';residential(k);}
  else if(dist==='industrial'){k.type='industrial';industrial(k);}
  else city(k,1+3.2*Math.exp(-Math.hypot(ox,oz)/240));
  for(const sx of [-1,1])for(const sz of [-1,1])lamp(k,sx*(LOT-1.2),sz*(LOT-1.2));
  const grp=new THREE.Group();grp.position.set(ox,0,oz);
  const meshes=[meshOf(k.B,facadeMat,true),meshOf(P,propMat,true),meshOf(k.G,glowMat,false)].filter(Boolean);
  meshes.forEach(m=>grp.add(m));scene.add(grp);
  const ch={key,cx,cz,grp,meshes,boxes:k.boxes,parked:[],type:k.type};
  for(const c of k.cars){c.src=ch;ch.parked.push(c);}
  if(!custom) for(const [sx,sz,dx,dz] of [[1,0,0,1],[-1,0,0,-1],[0,1,-1,0],[0,-1,1,0]]){
    if(r()>0.4)continue;const al=(r()-0.5)*(CH-30),c=makeCar(pick(CAR_COLS,r));
    placeCar(c,ox+sx*35+(sx?0:al),oz+sz*35+(sz?0:al),Math.atan2(-dx,-dz));c.src=ch;ch.parked.push(c);}
  chunks.set(key,ch);
}
function unloadChunk(ch){scene.remove(ch.grp);ch.meshes.forEach(m=>m.geometry.dispose());ch.parked.forEach(disposeCar);chunks.delete(ch.key);}
function updateStreaming(F){
  const pcx=Math.floor(F.x/CH),pcz=Math.floor(F.z/CH);let made=0;
  outer:for(let rr=0;rr<=R;rr++)for(let i=-rr;i<=rr;i++)for(let j=-rr;j<=rr;j++){
    if(Math.max(Math.abs(i),Math.abs(j))!==rr)continue;
    if(!chunks.has((pcx+i)+','+(pcz+j))){makeChunk(pcx+i,pcz+j);if(++made>=2)break outer;}}
  for(const ch of chunks.values())if(Math.max(Math.abs(ch.cx-pcx),Math.abs(ch.cz-pcz))>R+1)unloadChunk(ch);
}
