/* ---------- boot ---------- */
const focus=()=>player.car?player.car.obj.position:{x:player.x,y:player.y,z:player.z};
for(let rr=0;rr<=R;rr++)for(let i=-rr;i<=rr;i++)for(let j=-rr;j<=rr;j++){
  if(Math.max(Math.abs(i),Math.abs(j))!==rr)continue;const cx=Math.floor(player.x/CH)+i,cz=Math.floor(player.z/CH)+j;if(!chunks.has(cx+','+cz))makeChunk(cx,cz);}
{const c=makeCar(0x19b3a6);placeCar(c,47,75,Math.PI/2);c.src='free';freeCars.push(c);}
for(let i=0;i<MAXT;i++)spawnTraffic(null,focus(),true);
for(let i=0;i<MAXP;i++){const p={man:makePerson(pick(SHIRTS,R0),pick(PANTS,R0),pick(SKINS,R0),pick(HAIRS,R0))};spawnPed(p,focus(),true);peds.push(p);}
player.man.g.position.set(player.x,player.y,player.z);
camera.position.set(player.x,4,player.z+7);
window.pocketCity={player,chunks,traffic,peds,freeCars,interact,setTime:t=>{dayT=t;}};
let last=performance.now(),frame=0;
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(0.05,(now-last)/1000);last=now;frame++;
  const inp=readInput();
  if(player.car)drive(dt,inp);else walk(dt,inp);
  const F=focus();
  updateStreaming(F);updateTraffic(dt,F);updateWheels(dt,F);updatePeds(dt,F);updateSky(dt,F);updateCamera(dt,F,now);updateAudio(dt,inp);updateWater(dt,F);
  ground.position.set(Math.round(F.x/CH)*CH,0,Math.round(F.z/CH)*CH);
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  if(frame%4===0)drawMap(F);if(frame%10===0)updateHud();
  renderer.render(scene,camera);
}
requestAnimationFrame(loop);
