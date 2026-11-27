/* ---------- geometry builder: many boxes -> one mesh ---------- */
class GB{
  constructor(){this.p=[];this.n=[];this.uv=[];this.c=[];this.i=[];}
  box(x,y,z,sx,sy,sz,col,wall){
    const hx=sx/2,hz=sz/2,y0=y,y1=y+sy,cr=((col>>16)&255)/255,cg=((col>>8)&255)/255,cb=(col&255)/255;
    const F=[[1,0,0,[[x+hx,y0,z+hz],[x+hx,y0,z-hz],[x+hx,y1,z-hz],[x+hx,y1,z+hz]],sz],
      [-1,0,0,[[x-hx,y0,z-hz],[x-hx,y0,z+hz],[x-hx,y1,z+hz],[x-hx,y1,z-hz]],sz],
      [0,0,1,[[x-hx,y0,z+hz],[x+hx,y0,z+hz],[x+hx,y1,z+hz],[x-hx,y1,z+hz]],sx],
      [0,0,-1,[[x+hx,y0,z-hz],[x-hx,y0,z-hz],[x-hx,y1,z-hz],[x+hx,y1,z-hz]],sx],
      [0,1,0,[[x-hx,y1,z+hz],[x+hx,y1,z+hz],[x+hx,y1,z-hz],[x-hx,y1,z-hz]],0]];
    for(const [nx,ny,nz,q,w] of F){
      const b=this.p.length/3;
      for(let v=0;v<4;v++){this.p.push(...q[v]);this.n.push(nx,ny,nz);this.c.push(cr,cg,cb);
        if(wall&&w)this.uv.push((v===1||v===2)?w/16:0,(v>=2)?sy/14:0);else this.uv.push(0.02,0.48);}
      this.i.push(b,b+1,b+2,b,b+2,b+3);
    }
  }
  build(){const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
    g.setIndex(this.i);g.computeBoundingSphere();return g;}
}
