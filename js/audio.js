/* ---------- sound: engine, tyre screech and crashes, all made in the browser (no audio files) ---------- */
// Browsers only allow sound after the player clicks or presses a key, so initAudio() runs on the first input.
let actx=null,master=null,eng=null,screech=null,noiseBuf=null,lastThud=0,muted=false;
try{muted=localStorage.getItem('pocketCity.muted')==='1';}catch(e){}
function initAudio(){
  if(actx){if(actx.state==='suspended'&&!document.hidden)actx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  actx=new AC();master=actx.createGain();master.gain.value=muted?0:0.7;
  // a gentle limiter on everything, so sudden peaks (crashes) never spike in earphones
  const comp=actx.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=12;comp.ratio.value=4;
  master.connect(comp);comp.connect(actx.destination);
  // engine: a soft tone built from a few harmonics (a sawtooth or square buzzes harshly), a sine an octave
  // down for rumble, and a gentle low-pass filter with no resonant peak that opens a little with throttle
  const o1=actx.createOscillator(),o2=actx.createOscillator(),sub=actx.createGain(),lp=actx.createBiquadFilter(),g=actx.createGain();
  const harm=new Float32Array([0,1,0.55,0.4,0.22,0.15,0.08,0.05]);
  o1.setPeriodicWave(actx.createPeriodicWave(harm,new Float32Array(harm.length)));o2.type='sine';
  sub.gain.value=0.6;lp.type='lowpass';lp.Q.value=0.5;g.gain.value=0;
  o1.connect(lp);o2.connect(sub);sub.connect(lp);lp.connect(g);g.connect(master);o1.start();o2.start();
  eng={o1,o2,lp,g,rpm:850};
  // white noise, shared by the tyre screech (a narrow band of it) and crashes
  noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const src=actx.createBufferSource(),bp=actx.createBiquadFilter(),sg=actx.createGain();
  src.buffer=noiseBuf;src.loop=true;bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=6;sg.gain.value=0;
  src.connect(bp);bp.connect(sg);sg.connect(master);src.start();screech={bp,g:sg};
}
function setMuted(m){muted=m;if(master)master.gain.setTargetAtTime(m?0:0.7,actx.currentTime,0.05);try{localStorage.setItem('pocketCity.muted',m?'1':'0');}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!actx)return;if(document.hidden)actx.suspend();else actx.resume();});

const GEARS=[0,8,15,22,29,40];  // m/s where each of the 5 gears starts
function updateAudio(dt,inp){
  if(!actx)return;const c=player.car,t=actx.currentTime;
  if(!c||!playing()){eng.g.gain.setTargetAtTime(0,t,0.15);screech.g.gain.setTargetAtTime(0,t,0.05);return;}
  // gears are spread over each car's own top speed; pitch makes vans deeper and sports cars higher
  const sp=Math.abs(c.v)*34/c.T.top,thr=Math.abs(inp.y);let gi=0;while(gi<4&&sp>GEARS[gi+1])gi++;
  const tg=(sp-GEARS[gi])/(GEARS[gi+1]-GEARS[gi]);
  // revs climb through each gear and drop at the change; standing still, the throttle just revs the engine
  const target=sp<0.5?850+thr*1800:gi?2200+tg*2800:850+tg*4150;
  eng.rpm+=(target-eng.rpm)*(1-Math.exp(-dt*8));
  const f=eng.rpm/15*c.T.pitch;  // 850 rpm ~ 57 Hz up to 5000 rpm ~ 333 Hz: low enough to hum, high enough for earphones to play
  eng.o1.frequency.setTargetAtTime(f,t,0.03);eng.o2.frequency.setTargetAtTime(f/2,t,0.03);
  eng.lp.frequency.setTargetAtTime(250+eng.rpm*0.1+thr*250,t,0.05);
  eng.g.gain.setTargetAtTime(0.05+0.06*thr+0.02*tg,t,0.08);
  const slide=clamp((Math.abs(c.vl)-2)/7,0,1);  // screech grows with sideways speed
  screech.g.gain.setTargetAtTime(slide*0.22,t,0.05);screech.bp.frequency.setTargetAtTime(1500+Math.random()*500+slide*400,t,0.04);
}
// a crash or door: a short burst of low noise plus a falling thump; s = 0..1 strength
function carThud(s){
  if(!actx)return;const t=actx.currentTime;if(t-lastThud<0.15)return;lastThud=t;
  const src=actx.createBufferSource(),lp=actx.createBiquadFilter(),g=actx.createGain(),o=actx.createOscillator(),og=actx.createGain();
  src.buffer=noiseBuf;lp.type='lowpass';lp.frequency.value=400+s*1000;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.1+0.5*s,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
  o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(38,t+0.25);
  og.gain.setValueAtTime(0.0001,t);og.gain.exponentialRampToValueAtTime(0.15+0.6*s,t+0.01);og.gain.exponentialRampToValueAtTime(0.0001,t+0.3);
  src.connect(lp);lp.connect(g);g.connect(master);o.connect(og);og.connect(master);
  src.start(t);src.stop(t+0.4);o.start(t);o.stop(t+0.35);
}
