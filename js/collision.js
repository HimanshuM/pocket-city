/* ---------- collision ---------- */
const _boxes=[],_cars=[];
function gatherBoxes(x,z){_boxes.length=0;const cx=Math.floor(x/CH),cz=Math.floor(z/CH);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const c=chunks.get((cx+i)+','+(cz+j));if(c)for(const b of c.boxes)_boxes.push(b);}return _boxes;}
function pushBoxes(p,r,boxes){for(const b of boxes){
  const qx=clamp(p.x,b[0],b[2]),qz=clamp(p.z,b[1],b[3]),dx=p.x-qx,dz=p.z-qz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
  if(d2>1e-8){const d=Math.sqrt(d2),k=(r-d)/d;p.x+=dx*k;p.z+=dz*k;}
  else{const l=p.x-b[0],rr=b[2]-p.x,t=p.z-b[1],bt=b[3]-p.z,m=Math.min(l,rr,t,bt);
    if(m===l)p.x-=l+r;else if(m===rr)p.x+=rr+r;else if(m===t)p.z-=t+r;else p.z+=bt+r;}}}
function obbLocal(x,z,car){const q=car.obj.position,s=Math.sin(car.h),c=Math.cos(car.h),dx=x-q.x,dz=z-q.z;return [dx*c-dz*s,dx*s+dz*c,s,c];}
function obbDist(x,z,car){const [lx,lz]=obbLocal(x,z,car);return Math.hypot(lx-clamp(lx,-1,1),lz-clamp(lz,-2.25,2.25));}
function pushCarOBB(p,r,car){
  const [lx,lz,s,c]=obbLocal(p.x,p.z,car),ex=lx-clamp(lx,-1,1),ez=lz-clamp(lz,-2.25,2.25),d2=ex*ex+ez*ez;if(d2>=r*r)return;
  let px,pz;
  if(d2>1e-8){const d=Math.sqrt(d2),k=(r-d)/d;px=ex*k;pz=ez*k;}
  else{const ax=1-Math.abs(lx)+r,az=2.25-Math.abs(lz)+r;if(ax<az){px=Math.sign(lx||1)*ax;pz=0;}else{px=0;pz=Math.sign(lz||1)*az;}}
  p.x+=px*c+pz*s;p.z+=-px*s+pz*c;}
function nearCars(x,z,rad){_cars.length=0;
  const add=c=>{if(c!==player.car&&Math.abs(c.obj.position.x-x)<rad&&Math.abs(c.obj.position.z-z)<rad)_cars.push(c);};
  traffic.forEach(add);freeCars.forEach(add);
  const cx=Math.floor(x/CH),cz=Math.floor(z/CH);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const ch=chunks.get((cx+i)+','+(cz+j));if(ch)ch.parked.forEach(add);}
  return _cars;}
