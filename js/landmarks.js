/* ---------- landmarks: hand-built blocks at fixed places ---------- */
// Each one replaces the generator for its block. Spawn is in block 0,0 (the town square).

// Pocket Tower: a stepped skyscraper on a plaza, north-east of the square
CUSTOM['1,-1']=k=>{
  const {B,P,G}=k;
  P.box(0,0.2,0,62,0.05,62,0xcfc9bf);P.box(0,0.22,0,44,0.04,44,0xbdb6a9);
  for(const s of [-1,1])for(const t of [-24,-8,8,24]){tree(k,t,s*26,0.9);tree(k,s*26,t,0.9);}
  bench(k,-8,20,true);bench(k,8,20,true);bench(k,-8,-20,true);bench(k,8,-20,true);
  // podium, then three setbacks, each with a ledge on top; sizes are multiples of the 4 m window bay
  let y=0.2;
  // dark blue glass with gold ledges, so it stands out from the generated towers around it
  for(const [w,floors,col] of [[28,3,0xd8d2c4],[20,22,0x4f6f8f],[16,16,0x5a7c9c],[12,10,0x6688a8]]){
    const h=floors*3.5;B.box(0,y,0,w,h,w,col,true);y+=h;P.box(0,y,0,w+0.6,0.5,w+0.6,0xd9b25c);y+=0.5;}
  P.box(0,4,14.9,10,0.3,3,0x3e444c);  // entrance canopy
  P.box(0,y,0,8,4,8,0xd9b25c);P.box(0,y+4,0,5,2,5,0xc9a24c);  // gold crown
  P.box(0,y+6,0,0.8,22,0.8,0xd0d4da);G.box(0,y+28,0,1.1,1.1,1.1,0xff3030);  // spire with a red warning light
  solid(k,0,0,14,14,y+28);
};
