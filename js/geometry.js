/* ---------- geometry builder: many boxes -> one mesh ---------- */
class GB{
  constructor(){this.p=[];this.n=[];this.uv=[];this.c=[];this.i=[];}
  // wall: falsy = plain box; true or a FACADES name ('glass', 'brick', ...) = textured building walls
  box(x,y,z,sx,sy,sz,col,wall){
    const fo=wall?Math.max(0,FACADES.indexOf(wall))*64:0,hx=sx/2,hz=sz/2,y0=y,y1=y+sy,cr=((col>>16)&255)/255,cg=((col>>8)&255)/255,cb=(col&255)/255;
    const F=[[1,0,0,[[x+hx,y0,z+hz],[x+hx,y0,z-hz],[x+hx,y1,z-hz],[x+hx,y1,z+hz]],sz],
      [-1,0,0,[[x-hx,y0,z-hz],[x-hx,y0,z+hz],[x-hx,y1,z+hz],[x-hx,y1,z-hz]],sz],
      [0,0,1,[[x-hx,y0,z+hz],[x+hx,y0,z+hz],[x+hx,y1,z+hz],[x-hx,y1,z+hz]],sx],
      [0,0,-1,[[x+hx,y0,z-hz],[x-hx,y0,z-hz],[x-hx,y1,z-hz],[x+hx,y1,z-hz]],sx],
      [0,1,0,[[x-hx,y1,z+hz],[x+hx,y1,z+hz],[x+hx,y1,z-hz],[x-hx,y1,z-hz]],0]];
    for(const [nx,ny,nz,q,w] of F){
      const b=this.p.length/3;
      for(let v=0;v<4;v++){this.p.push(...q[v]);this.n.push(nx,ny,nz);this.c.push(cr,cg,cb);
        if(wall&&w)this.uv.push(fo+((v===1||v===2)?w/16:0),(v>=2)?sy/14:0);else this.uv.push(fo+0.02,0.48);}
      this.i.push(b,b+1,b+2,b,b+2,b+3);
    }
  }
  // one flat untextured face; v = 4 corners, counter-clockwise when seen from outside
  quad(v,n,col){
    const b=this.p.length/3,cr=((col>>16)&255)/255,cg=((col>>8)&255)/255,cb=(col&255)/255;
    for(const q of v){this.p.push(...q);this.n.push(...n);this.c.push(cr,cg,cb);this.uv.push(0.02,0.48);}
    this.i.push(b,b+1,b+2,b,b+2,b+3);
  }
  // gable roof (a triangular prism). Like box, y is the bottom. The ridge runs along x if alongX, else along z.
  // The two triangular ends use gcol (e.g. the wall colour).
  roof(x,y,z,sx,sy,sz,col,alongX,gcol=col){
    const hl=(alongX?sx:sz)/2,hw=(alongX?sz:sx)/2,y1=y+sy,L=Math.hypot(hw,sy),a=hw/L,b=sy/L;
    const P=(u,yy,w)=>alongX?[x+u,yy,z+w]:[x+w,yy,z-u],N=(u,yy,w)=>alongX?[u,yy,w]:[w,yy,-u];
    this.quad([P(-hl,y,hw),P(hl,y,hw),P(hl,y1,0),P(-hl,y1,0)],N(0,a,b),col);
    this.quad([P(hl,y,-hw),P(-hl,y,-hw),P(-hl,y1,0),P(hl,y1,0)],N(0,a,-b),col);
    this.quad([P(hl,y,hw),P(hl,y,-hw),P(hl,y1,0),P(hl,y1,0)],N(1,0,0),gcol);
    this.quad([P(-hl,y,-hw),P(-hl,y,hw),P(-hl,y1,0),P(-hl,y1,0)],N(-1,0,0),gcol);
  }
  build(){const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
    g.setIndex(this.i);g.computeBoundingSphere();return g;}
}
