/* ---------- people ---------- */
function makePerson(shirt,pants,skin,hair){
  const g=new THREE.Group(),B=new GB();
  B.box(0,0.82,0,0.62,0.72,0.36,shirt);B.box(0,1.56,0,0.42,0.42,0.42,skin);
  B.box(0,1.96,0.03,0.46,0.12,0.46,hair);B.box(0,1.62,0.18,0.46,0.36,0.1,hair);
  B.box(-0.1,1.74,-0.215,0.07,0.07,0.02,0x1a1a1a);B.box(0.1,1.74,-0.215,0.07,0.07,0.02,0x1a1a1a);
  const body=new THREE.Mesh(B.build(),propMat);body.castShadow=true;g.add(body);
  const limb=(col,w,h,x,y)=>{const L=new GB();L.box(0,-h,0,w,h,w*1.1,col);const m=new THREE.Mesh(L.build(),propMat);m.castShadow=true;m.position.set(x,y,0);g.add(m);return m;};
  const m={g,legL:limb(pants,0.24,0.82,-0.16,0.82),legR:limb(pants,0.24,0.82,0.16,0.82),armL:limb(shirt,0.17,0.68,-0.41,1.52),armR:limb(shirt,0.17,0.68,0.41,1.52),phase:0};
  scene.add(g);return m;}
function animPerson(m,speed,dt){m.phase+=dt*speed*2.4;const a=Math.min(1,speed/1.5)*0.65,s=Math.sin(m.phase)*a;
  m.legL.rotation.x=s;m.legR.rotation.x=-s;m.armL.rotation.x=-s*0.9;m.armR.rotation.x=s*0.9;}
const peds=[],MAXP=36;
const pathAt=s=>{const side=Math.floor(s/64)%4,t=s%64-32;return side===0?[t,-32]:side===1?[32,t]:side===2?[-t,32]:[-32,-t];};
function spawnPed(p,F,init){
  const fcx=Math.floor(F.x/CH),fcz=Math.floor(F.z/CH);
  for(let tries=0;tries<12;tries++){
    const cx=fcx+((R0()*5)|0)-2,cz=fcz+((R0()*5)|0)-2,ch=chunks.get(cx+','+cz);if(!ch||!ch.peds)continue;
    const s=R0()*256,[lx,lz]=pathAt(s),ox=(cx+0.5)*CH,oz=(cz+0.5)*CH;
    if(!init&&Math.hypot(ox+lx-F.x,oz+lz-F.z)<30)continue;
    Object.assign(p,{key:ch.key,ox,oz,s,dir:R0()<0.5?-1:1,base:1.1+R0()*0.6,offx:0,offz:0,panic:0,hy:0,vy:0,ok:true});p.man.g.visible=true;return;}
  p.ok=false;p.man.g.visible=false;}
function updatePeds(dt,F){
  const pc=player.car;
  for(const p of peds){
    if(!p.ok||!chunks.has(p.key)){spawnPed(p,F,false);if(!p.ok)continue;}
    const cur=p.man.g.position;
    if(pc){const q=pc.obj.position,dx=cur.x-q.x,dz=cur.z-q.z,d=Math.hypot(dx,dz),sp=Math.abs(pc.v);
      if(sp>4&&d<11)p.panic=2.5;
      if(d<2.7&&sp>0.8){const k=(2.7-d)/(d||1);p.offx+=dx*k;p.offz+=dz*k;if(p.hy===0)p.vy=5;p.panic=3;}}
    const spd=p.base*(p.panic>0?2.7:1);p.panic-=dt;
    p.s=(p.s+p.dir*spd*dt+256)%256;
    const [lx,lz]=pathAt(p.s),[ax,az]=pathAt((p.s+p.dir*0.6+256)%256),dec=Math.exp(-dt*1.5);
    p.offx*=dec;p.offz*=dec;p.vy-=20*dt;p.hy=Math.max(0,p.hy+p.vy*dt);if(p.hy===0)p.vy=0;
    const x=p.ox+lx+p.offx,z=p.oz+lz+p.offz;
    p.man.g.position.set(x,groundY(x,z)+p.hy,z);p.man.g.rotation.y=Math.atan2(-(ax-lx),-(az-lz));
    animPerson(p.man,spd,dt);
    if(Math.hypot(x-F.x,z-F.z)>190)p.ok=false;
  }
}
