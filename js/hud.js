/* ---------- HUD and minimap ---------- */
const map=$('map'),mg=map.getContext('2d');
const MAP_COLS={park:'#6fae57',custom:'#e9dcc0',residential:'#a9c98f',industrial:'#8d8f94'};
function sizeMap(){const s=map.clientWidth*Math.min(2,devicePixelRatio||1);if(map.width!==s){map.width=map.height=s;}}
function drawMap(F){
  sizeMap();const W=map.width,sc=W/240;mg.setTransform(1,0,0,1,0,0);mg.fillStyle='#2f3238';mg.fillRect(0,0,W,W);
  mg.translate(W/2,W/2);mg.rotate(cam.yaw);mg.scale(sc,sc);mg.translate(-F.x,-F.z);
  for(const ch of chunks.values()){const x0=ch.cx*CH+ROADW,z0=ch.cz*CH+ROADW;if(Math.abs(x0+LOT-F.x)>220||Math.abs(z0+LOT-F.z)>220)continue;
    mg.fillStyle=MAP_COLS[ch.type]||'#bdb5a6';mg.fillRect(x0,z0,LOT*2,LOT*2);
    mg.fillStyle='#867a6b';for(const b of ch.boxes)if(b[4]>6)mg.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);}
  mg.fillStyle='#ffffff';for(const c of traffic)mg.fillRect(c.obj.position.x-2,c.obj.position.z-2,4,4);
  mg.fillStyle='#19b3a6';for(const c of freeCars){mg.beginPath();mg.arc(c.obj.position.x,c.obj.position.z,4,0,7);mg.fill();}
  const h=player.car?player.car.h:player.h;mg.translate(F.x,F.z);mg.rotate(-h);
  mg.fillStyle='#ff7a45';mg.strokeStyle='#14171f';mg.lineWidth=1.5;mg.beginPath();mg.moveTo(0,-9);mg.lineTo(6.5,7);mg.lineTo(0,3.5);mg.lineTo(-6.5,7);mg.closePath();mg.fill();mg.stroke();
}
function updateHud(){
  const hrs=dayT*24,hh=Math.floor(hrs),mm=Math.floor((hrs-hh)*60);
  $('clock').textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
  $('mode').textContent=player.car?Math.round(Math.abs(player.car.v)*3.6)+' km/h':(keys.ShiftLeft||keys.ShiftRight?'Running':'On foot');
  $('stream').textContent=`Streaming ${chunks.size} blocks · ${traffic.length} cars · ${peds.filter(p=>p.ok).length} people`;
  let near=false;if(!player.car&&playing())for(const c of nearCars(player.x,player.z,7))if(obbDist(player.x,player.z,c)<1.8){near=true;break;}
  const hint=$('hint');hint.style.display=near?'block':'none';hint.textContent=coarse?'Tap Car to drive':'Press E to drive';
  runBtn.textContent=player.car?'Brake':'Run';
}
