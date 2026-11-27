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

// City Hall: columns, a gable over the entrance and a stepped green dome, facing the town square to the east (+x)
CUSTOM['-1,0']=k=>{
  const {B,P}=k,STONE=0xefe6d6,TRIM=0xd9cfbd,WHITE=0xf6f1e8,DOME=0x5f9e8f;
  P.box(0,0.2,0,62,0.05,62,0x6aab4f);P.box(19,0.22,0,22,0.05,32,0xd9cdb6);  // lawn and forecourt
  B.box(-6,0.2,0,26,14,40,STONE,true);P.box(-6,14.2,0,27,0.8,41,TRIM);solid(k,-6,0,13,20,35);
  // portico: three steps, six columns, a beam and the triangular gable on top
  P.box(11,0.2,0,9,0.25,24,0xd9d2c4);P.box(10.6,0.45,0,8.2,0.25,23,0xd9d2c4);P.box(10.2,0.7,0,7.4,0.25,22,0xd9d2c4);
  for(let z=-10;z<=10;z+=4)P.box(13,0.95,z,1.1,9.2,1.1,WHITE);
  P.box(10.2,10.15,0,7.6,1.2,23,TRIM);P.roof(10.2,11.35,0,7.6,3.2,23,TRIM,true,WHITE);
  solid(k,10.8,0,4.7,12,14.6);
  // dome: a drum with windows, then stepped rings, a lantern and a flag
  B.box(-6,15,0,14,5,14,STONE,true);P.box(-6,20,0,15,0.5,15,TRIM);
  let y=20.5;for(const s of [13,11,9,6.5,4]){P.box(-6,y,0,s,1.3,s,DOME);y+=1.3;}
  P.box(-6,y,0,2.2,2.4,2.2,WHITE);P.box(-6,y+2.4,0,2.8,0.4,2.8,DOME);
  P.box(-6,y+2.8,0,0.15,5,0.15,0xdddddd);P.box(-6,y+6.4,0.95,0.05,1.3,1.8,0xe8483c);
  // forecourt: fountain, flagpoles, benches, trees
  P.box(22,0.2,0,6,0.5,6,0xcfc7b8);P.box(22,0.7,0,5,0.05,5,0x4fb0d9);solid(k,22,0,3,3,0.7);
  for(const [z,c] of [[-9,0x3f6fd9],[9,0xf2b33d]]){P.box(26,0.2,z,0.2,10,0.2,0xdddddd);P.box(26,8.6,z+1,0.05,1.3,1.8,c);solid(k,26,z,0.15,0.15,10.2);}
  bench(k,18,14,true);bench(k,18,-14,true);
  for(const x of [-24,-14,-4,6])for(const s of [-1,1])tree(k,x,s*26,1);
  for(const s of [-1,1])tree(k,-26,s*12,1);
};
