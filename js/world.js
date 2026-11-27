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
function meshOf(gb,mat,cast){if(!gb.i.length)return null;const m=new THREE.Mesh(gb.build(),mat);m.castShadow=cast;m.receiveShadow=true;return m;}
function makeChunk(cx,cz){
  const key=cx+','+cz,r=rng(hash2(cx,cz)),ox=(cx+0.5)*CH,oz=(cz+0.5)*CH;
  const k={B:new GB(),P:new GB(),G:new GB(),boxes:[],ox,oz,r,type:'city'},P=k.P;
  P.box(0,0,0,LOT*2,0.2,LOT*2,0xb9b2a5);
  P.box(0,0,LOT-0.15,LOT*2,0.24,0.3,0x8f897e);P.box(0,0,-LOT+0.15,LOT*2,0.24,0.3,0x8f897e);
  P.box(LOT-0.15,0,0,0.3,0.24,LOT*2,0x8f897e);P.box(-LOT+0.15,0,0,0.3,0.24,LOT*2,0x8f897e);
  const custom=CUSTOM[key];
  if(custom){k.type='custom';custom(k);}
  else if(r()<0.13){k.type='park';park(k);}
  else city(k,1+3.2*Math.exp(-Math.hypot(ox,oz)/240));
  for(const sx of [-1,1])for(const sz of [-1,1])lamp(k,sx*(LOT-1.2),sz*(LOT-1.2));
  const grp=new THREE.Group();grp.position.set(ox,0,oz);
  const meshes=[meshOf(k.B,facadeMat,true),meshOf(P,propMat,true),meshOf(k.G,glowMat,false)].filter(Boolean);
  meshes.forEach(m=>grp.add(m));scene.add(grp);
  const ch={key,cx,cz,grp,meshes,boxes:k.boxes,parked:[],type:k.type};
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
