/* ---------- traffic lights ---------- */
// Junctions away from the coast have a signal head on the street-lamp pole at each corner. Each head faces the
// traffic that drives up to it on its right-hand side. A junction alternates north-south and east-west green, with
// yellow and a short all-red gap between, and each junction is offset in time so neighbours don't change together.
const SIG_CYCLE=28;let signalT=0;
const hasSignals=(nx,nz)=>nz<COAST_CZ;  // no lights on the seaside road's T-junctions
// light for traffic on the north-south road (ew=0) or the east-west road (ew=1) at junction node (nx,nz)
function signalAt(nx,nz,ew){
  const t=(signalT+hash2(nx,nz)%SIG_CYCLE)%SIG_CYCLE,u=ew?(t+14)%SIG_CYCLE:t;
  return u<10?'g':u<12.5?'y':'r';
}
// called by makeChunk for the lamp at the chunk corner (sx,sz): a housing on the pole, facing the road
function signalHead(k,cx,cz,sx,sz){
  const nx=cx+(sx>0?1:0),nz=cz+(sz>0?1:0);if(!hasSignals(nx,nz))return;
  const jx=-sx,jz=-sz,fx=jx===jz?0:jx,fz=jx===jz?jz:0,lx=sx*(LOT-1.2),lz=sz*(LOT-1.2);  // corner as seen from the junction
  k.P.box(lx+fx*0.25,2.6,lz+fz*0.25,fx?0.35:0.5,1.3,fx?0.5:0.35,0x2b2d33);
  k.signals.push({x:k.ox+lx+fx*0.46,z:k.oz+lz+fz*0.46,fx,fz,nx,nz,ew:fx?1:0});
}
// the lit lamp of every head is one instanced mesh: it moves to the red, yellow or green slot and takes that colour
const sigLamps=new THREE.InstancedMesh(new THREE.BoxGeometry(0.3,0.3,0.06),new THREE.MeshBasicMaterial(),1200);
sigLamps.frustumCulled=false;sigLamps.setColorAt(0,new THREE.Color());sigLamps.count=0;scene.add(sigLamps);
const SIG_COL={g:new THREE.Color(0x3dff6a),y:new THREE.Color(0xffc21a),r:new THREE.Color(0xff2a2a)},SIG_Y={r:3.55,y:3.25,g:2.95};
const _sm=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_sp=new THREE.Vector3(),_s1=new THREE.Vector3(1,1,1),_sy=new THREE.Vector3(0,1,0);
function updateSignals(dt){
  signalT=(signalT+dt)%(SIG_CYCLE*1000);let n=0;
  for(const ch of chunks.values())for(const s of ch.signals){if(n>=1200)break;const st=signalAt(s.nx,s.nz,s.ew);
    _sp.set(s.x,SIG_Y[st],s.z);_sq.setFromAxisAngle(_sy,Math.atan2(s.fx,s.fz));
    sigLamps.setMatrixAt(n,_sm.compose(_sp,_sq,_s1));sigLamps.setColorAt(n,SIG_COL[st]);n++;}
  sigLamps.count=n;sigLamps.instanceMatrix.needsUpdate=true;sigLamps.instanceColor.needsUpdate=true;
}
