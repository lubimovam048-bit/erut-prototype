export type LabelBox={id:string;x:number;y:number;width:number;height:number};
export type Rect={x:number;y:number;width:number;height:number};
export const intersects=(a:Rect,b:Rect,gap=5)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
/** Deterministic screen-space placement: nearby candidates first, no overlapping labels. */
export function placeMapLabels(labels:LabelBox[],width:number,height:number,obstacles:Rect[]=[]){
 const occupied=[...obstacles];const result=new Map<string,Rect>();
 for(const label of [...labels].sort((a,b)=>b.width-a.width||a.y-b.y||a.x-b.x||a.id.localeCompare(b.id))){
  const candidates:[number,number][]=[[0,-26],[0,26],[label.width/2+16,0],[-label.width/2-16,0]];
  for(const radius of [48,72,100,135,175,215,260])for(const angle of [-90,90,0,180,-45,45,135,225])candidates.push([Math.cos(angle*Math.PI/180)*radius,Math.sin(angle*Math.PI/180)*radius]);
  const fallback:[number,number][]=[];
  for(let y=65+label.height/2;y<=height-55-label.height/2;y+=12)for(let x=12+label.width/2;x<=width-12-label.width/2;x+=12)fallback.push([x-label.x,y-label.y]);
  fallback.sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));candidates.push(...fallback);
  for(const [dx,dy] of candidates){const box={x:label.x+dx-label.width/2,y:label.y+dy-label.height/2,width:label.width,height:label.height};
   if(box.x<12||box.y<65||box.x+box.width>width-12||box.y+box.height>height-55||occupied.some(o=>intersects(box,o)))continue;
   result.set(label.id,box);occupied.push(box);break;
  }
 }
 return result;
}


/** Compact badges touch their map coordinate; never move to a free grid slot. */
export function placeAnchoredBadges(labels:LabelBox[],width:number,height:number,_obstacles:Rect[]=[]){
 const result=new Map<string,Rect>(),occupied:Rect[]=[];
 const ordered=[...labels].sort((a,b)=>b.width-a.width||a.y-b.y||a.x-b.x);
 const options=new Map<string,Rect[]>();
 for(const l of ordered){
  const candidates=[{x:l.x+4,y:l.y-l.height/2},{x:l.x-l.width-4,y:l.y-l.height/2},{x:l.x-l.width/2,y:l.y-l.height-4},{x:l.x-l.width/2,y:l.y+4},{x:l.x-l.width,y:l.y+4},{x:l.x,y:l.y-l.height-4},{x:l.x-l.width,y:l.y-l.height-4},{x:l.x,y:l.y+4}].map(p=>({...p,width:l.width,height:l.height}));
  options.set(l.id,candidates);
  const score=(b:Rect)=>occupied.reduce((sum,o)=>sum+Math.max(0,Math.min(b.x+b.width+4,o.x+o.width)-Math.max(b.x-4,o.x))*Math.max(0,Math.min(b.y+b.height+4,o.y+o.height)-Math.max(b.y-4,o.y)),0)+(b.x<4||b.y<4||b.x+b.width>width-4||b.y+b.height>height-4?1e6:0);
  const best=candidates.reduce((a,b)=>score(b)<score(a)?b:a);result.set(l.id,best);occupied.push(best);
 }
 // Reconsider early choices once all neighbours are known.
 for(let pass=0;pass<4;pass++)for(const l of ordered){
  const others=[...result.entries()].filter(([id])=>id!==l.id).map(([,r])=>r);
  const score=(b:Rect)=>others.reduce((sum,o)=>sum+Math.max(0,Math.min(b.x+b.width+4,o.x+o.width)-Math.max(b.x-4,o.x))*Math.max(0,Math.min(b.y+b.height+4,o.y+o.height)-Math.max(b.y-4,o.y)),0)+(b.x<4||b.y<4||b.x+b.width>width-4||b.y+b.height>height-4?1e6:0);
  const current=result.get(l.id)!;
  result.set(l.id,options.get(l.id)!.reduce((a,b)=>score(b)<score(a)?b:a,current));
 }
 return result;
}
