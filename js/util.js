/* ---------- shared helpers and constants ---------- */
const $ = id => document.getElementById(id);
const coarse = matchMedia('(pointer:coarse)').matches;
if (coarse) document.body.classList.add('coarse');
if (!window.THREE) {
  $('introText').textContent = 'The 3D engine could not load. Check your connection and reload the page.';
  $('go').style.display = 'none';
  throw new Error('three.js failed to load');
}

/* ---------- world constants ---------- */
const CH = 80, HALF = 40, ROADW = 6, LOT = 34, BLD = 30;  // chunk size, road half-width, lot half-size, building zone
const COAST_CZ = 4, COAST_Z = COAST_CZ*CH + HALF - LOT;  // shore block row (seaside road along its north edge); shore surfaces start at z = COAST_Z
const R = 3;                       // stream radius in chunks (7x7 around you)
const SEED = 20261127, DAY_LEN = 480;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function hash2(x,z){let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(SEED,1442695041);h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0;}
function rng(s){let a=s>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const R0 = rng((Date.now()&0xffffff)+1);
const pick=(arr,r)=>arr[(r()*arr.length)|0];
function shade(c,k){const f=v=>Math.min(255,v*k)|0;return f((c>>16)&255)<<16|f((c>>8)&255)<<8|f(c&255);}
const BCOLS=[0xe8d5b5,0xd99a6c,0xc9d6df,0xb8c4a8,0xe6b8a2,0xf1e3c6,0xa9b8c9,0xd4a5a5,0xcfc2e0,0xf0c987];
const AWN=[0xe8483c,0x2f8f83,0xf2b33d,0x3f6fd9,0xffffff];
const GREENS=[0x5c9e48,0x4f8f3f,0x6aab4f,0x7cb85a];
const GLASS_COLS=[0xc4d6e6,0xb3c9da,0xd2dce6,0xbcc8d2,0xa8bfd0,0xd6dde3], BRICK_COLS=[0xc0705a,0xb5604a,0xa85a48,0xc98a6a,0x9c5c4c,0xd09a7a];
const HOUSE_COLS=[0xf3e7d3,0xe9c9a8,0xcfe0e8,0xf1d6d6,0xd8e4c8,0xf5e1a4,0xe0d4ec,0xfbf8f2], ROOF_COLS=[0x9c4a3a,0x6e4b3a,0x4a5563,0x7a3f3f,0x5b6b4a];
const IND_COLS=[0x9aa3ab,0xb7a58a,0x7d8a96,0xa15c3e,0xc9c3b6], CONT_COLS=[0xc0392b,0x2e6da4,0x3f8f5a,0xd98e04,0x8e44ad,0x7f8c8d];
const CAR_COLS=[0xd94141,0x3f7fd9,0xf2f2f2,0x2b2d33,0xf2b33d,0x3fae6a,0x8a5cd6,0xa7b1bc,0xe86f2d,0x1f4d7a];
const SKINS=[0xf1c9a5,0xd9a77e,0xa87554,0x7a4f35,0xe8b996], HAIRS=[0x2b1d14,0x5a3a22,0x111111,0xc9a15a,0x8a8a8a];
const SHIRTS=[0x3f7fd9,0xe8483c,0x2f8f83,0xf2b33d,0xffffff,0x8a5cd6,0x333a45,0x7cb85a], PANTS=[0x2d3a55,0x3a3a3a,0x6b5a45,0x1f2a44,0x8a8a8a];
