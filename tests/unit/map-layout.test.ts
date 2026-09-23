import {expect,it} from 'vitest';
import {intersects,placeMapLabels,type LabelBox} from '../../src/map-layout';
it.each([[810,440],[580,500],[350,540]])('keeps dense campus labels apart and within %sx%s', (width,height)=>{
 const input:LabelBox[]=Array.from({length:11},(_,i)=>({id:String(i),x:width/2+(i%4)*8,y:height/2+Math.floor(i/4)*12,width:80+(i%3)*15,height:32}));
 const placed=[...placeMapLabels(input,width,height).values()];expect(placed.length).toBeGreaterThanOrEqual(width>500?10:6);
 for(let i=0;i<placed.length;i++){const b=placed[i];expect(b.x).toBeGreaterThanOrEqual(12);expect(b.x+b.width).toBeLessThanOrEqual(width-12);expect(b.y).toBeGreaterThanOrEqual(65);expect(b.y+b.height).toBeLessThanOrEqual(height-55);for(const other of placed.slice(i+1))expect(intersects(b,other)).toBe(false);}
});
it('keeps reserved controls free and does not change placement between renders',()=>{const labels=[{id:'main',x:220,y:250,width:175,height:45},{id:'near',x:240,y:252,width:90,height:32}];const reserved=[{x:0,y:330,width:250,height:170}];const a=placeMapLabels(labels,600,500,reserved);expect([...a]).toEqual([...placeMapLabels(labels,600,500,reserved)]);for(const box of a.values())expect(intersects(box,reserved[0])).toBe(false);});

it('moves labels around fixed coordinate dots without changing geographical anchors',()=>{
 const labels=[{id:'a',x:200,y:220,width:130,height:32},{id:'b',x:214,y:218,width:120,height:32}];
 const snapshot=JSON.stringify(labels);const dots=labels.map(l=>({x:l.x-10,y:l.y-10,width:20,height:20}));
 const placed=placeMapLabels(labels,700,500,dots);expect(placed.size).toBe(2);expect(JSON.stringify(labels)).toBe(snapshot);
 for(const box of placed.values())for(const dot of dots)expect(intersects(box,dot)).toBe(false);
});
