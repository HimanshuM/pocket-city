/* ---------- coast: the sea to the south ---------- */
// Block row COAST_CZ is the shore: its north edge is the seaside road (z = COAST_CZ*80), and every row
// south of it is open sea. Shore blocks span the full 80 m width so they also cover the road stubs between them.
// Local z inside a shore block: -40 road centre, -34..-28 walkway, then sand (beach) or a sea wall at -22
// (promenade). Sea level is y = -0.8; the city's ground plane is clipped away south of COAST_Z.
const SEA_Y=-0.8,SHORE_OZ=(COAST_CZ+0.5)*CH,PAVE=0xd8cdb8;
// beach or promenade, in pairs of blocks, the same on every visit
const shoreType=cx=>rng(hash2(Math.floor(cx/2),4242))()<0.55?'beach':'promenade';
// beach sand height at local z: flat walkway, a gentle slope down to the waterline at -6, then the sea floor to the buoys at +8
const sandY=lz=>lz<=-28?0.2:lz<=-6?0.2-(lz+28)/22:SEA_Y-(lz+6)/14*1.1;
function coastY(x,z){
  if(z>=(COAST_CZ+1)*CH)return SEA_Y-1.1;
  return shoreType(Math.floor(x/CH))==='beach'?sandY(z-SHORE_OZ):0.2;
}
function palm(k,x,z){
  const {P,r}=k,lean=(r()-0.5)*0.5;let y=0.2;
  for(let i=0;i<5;i++){P.box(x+lean*i,y,z,0.45-i*0.04,1.4,0.45-i*0.04,i%2?0x8a6a45:0x7a5c3b);y+=1.4;}
  const tx=x+lean*5,g=pick(GREENS,r);
  P.box(tx,y-0.1,z,3.6,0.18,0.9,g);P.box(tx,y-0.1,z,0.9,0.18,3.6,g);P.box(tx,y+0.05,z,2.4,0.16,2.4,shade(g,1.15));
  P.box(tx,y-0.5,z,0.5,0.4,0.5,0x6b4a2f);solid(k,x,z,0.25,0.25,y);
}
function walkway(k,depth,lampZ){  // paving from the curb, with palms on the road side and lamps on the sea side
  const {P,r}=k;
  P.box(0,0,-34+depth/2,80,0.2,depth,PAVE);P.box(0,0,-33.85,80,0.24,0.3,0x8f897e);P.box(0,0.2,-34+depth/2,80,0.02,1.2,0xc4b59a);
  for(const x of [-32,-16,0,16,32]){lamp(k,x,lampZ);if(r()<0.8)palm(k,x+8,-32.3);}
}
function promenade(k){
  const {P,r}=k;
  walkway(k,12,-23.4);
  P.box(0,-2.4,-21.7,80,2.6,0.6,0xb8ae9c);  // sea wall
  for(let x=-40;x<=40;x+=2.5)P.box(x,0.2,-22.2,0.1,1.1,0.1,0xe8e8e8);
  P.box(0,1.25,-22.2,80,0.07,0.07,0xe8e8e8);P.box(0,0.75,-22.2,80,0.05,0.05,0xe8e8e8);solid(k,0,-22.2,40,0.2,1.3);
  for(const x of [-24,-8,8,24])bench(k,x,-25,true);
  if(r()<0.6){const x=(r()-0.5)*50,z=4+r()*20,c=pick([0xf4f4f0,0x3f6fd9,0xe8483c],r);  // a moored boat
    P.box(x,SEA_Y-0.3,z,2.2,0.8,5.5,c);P.box(x,SEA_Y+0.5,z+0.6,1.6,1,2,0xf4f4f0);P.box(x,SEA_Y+0.5,z-2.4,2.2,0.1,0.6,0x8a6a45);}
}
function beach(k,cx){
  const {P,r}=k,SAND=0xe9d7a6,WET=0xcdb47e;
  walkway(k,6,-29);
  // sand: dry slope down to the waterline, then wet sand under the water out to the buoys
  P.quad([[-40,sandY(-6),-6],[40,sandY(-6),-6],[40,0.2,-28],[-40,0.2,-28]],[0,0.999,0.045],SAND);
  P.quad([[-40,sandY(8),8],[40,sandY(8),8],[40,sandY(-6),-6],[-40,sandY(-6),-6]],[0,0.996,0.078],WET);
  P.box(0,SEA_Y-0.02,-5,80,0.05,1.6,0xeef6f8);  // foam at the waterline
  // a line of buoys marks how far you can wade
  for(let x=-38;x<=38;x+=4)P.box(x,SEA_Y-0.2,8,0.5,0.45,0.5,0xff7a1a);
  P.box(0,SEA_Y+0.05,8,80,0.04,0.04,0xf4f4f0);solid(k,0,8,40,0.3,2);
  for(let n=0;n<7;n++){const x=(r()-0.5)*72,z=-25+r()*15,y=sandY(z),c=pick(AWN,r);  // umbrellas and towels
    P.box(x,y,z,0.1,2.4,0.1,0xf4f4f0);P.box(x,y+2.3,z,2.6,0.12,2.6,c);P.box(x,y+2.42,z,1.4,0.18,1.4,c);
    P.box(x+1.3,y,z+0.2,1,0.03,1.9,pick(SHIRTS,r));}
  if(r()<0.6){const x=(r()-0.5)*50,z=-13,y=sandY(z);  // lifeguard tower
    for(const sx of [-1,1])for(const sz of [-1,1])P.box(x+sx*0.9,y,z+sz*0.9,0.18,2.6,0.18,0xf4f4f0);
    P.box(x,y+2.6,z,2.4,0.15,2.4,0xf4f4f0);P.box(x,y+2.75,z,1.8,1.4,1.8,0xe8483c);P.roof(x,y+4.15,z,2.4,0.8,2.4,0xf4f4f0,true);solid(k,x,z,1.2,1.2,5);}
  // rocks where the beach meets a promenade, so you can't wade round behind its sea wall
  for(const s of [-1,1])if(shoreType(cx+s)==='promenade'){
    for(let z=-21;z<=8;z+=2.4){const base=sandY(z)-0.3;P.box(s*38.6+(r()-0.5)*0.6,base,z,2+r()*0.8,0.6-base+r()*0.4,2.3,r()<0.5?0x8d8d86:0x7b7b74);}
    solid(k,s*38.6,-6.5,1.5,14.8,1.6);}
}
function shore(k,cx){k.type=shoreType(cx);if(k.type==='beach')beach(k,cx);else promenade(k);}

/* the sea surface: one big plane that follows the player, with slowly drifting ripples */
function makeWaterTex(){
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),r=rng(31);
  g.fillStyle='#ffffff';g.fillRect(0,0,256,256);
  for(let i=0;i<420;i++){const v=r()<0.5?'rgba(255,255,255,.9)':'rgba(170,200,215,.55)';g.fillStyle=v;g.fillRect(r()*256,r()*256,6+r()*22,2);}
  return canvasTex(c);
}
const waterTex=makeWaterTex();waterTex.repeat.set(100,50);
const water=new THREE.Mesh(new THREE.PlaneGeometry(1600,800),new THREE.MeshPhongMaterial({color:0x2b7ea8,specular:0x9fc4d6,shininess:70,map:waterTex}));
water.rotation.x=-Math.PI/2;water.receiveShadow=true;scene.add(water);
// hide the city's road-textured ground plane over the sea
renderer.localClippingEnabled=true;
groundMat.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,0,-1),COAST_Z)];
function updateWater(dt,F){
  water.position.set(Math.round(F.x/CH)*CH,SEA_Y,COAST_Z+400);
  waterTex.offset.x+=dt*0.004;waterTex.offset.y+=dt*0.0025;
}
