import {it,expect} from 'vitest';
import {campusPreview,buildingPreview,pointPreview} from '../../src/map-preview';
import {buildings,campusPoints,campusGeometry} from '../../src/campus';
it('previews preserve unknown counts and never estimate individual floor areas',()=>{
 expect(campusPreview('sochi').metrics[0].value).toBe('—');
 expect(campusPreview('obraztsova').metrics[0].value.replace(/\s/g,'')).toBe('16574');
 expect(buildingPreview(buildings.find(b=>b.id==='rail-1')!).metrics[0].value).toBe('—');
 expect(buildingPreview(buildings.find(b=>b.id==='economics-1')!).metrics[0].value.replace(/\s/g,'')).toBe('18000');
 expect(pointPreview(campusPoints.find(p=>p.kind==='cameras')!).detail).toContain('не подключён');
});
function inside(p:number[],r:number[][]){let result=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i]!,b=r[j]!;if((a[1]!>p[1]!)!==(b[1]!>p[1]!)&&p[0]!<(b[0]!-a[0]!)*(p[1]!-a[1]!)/(b[1]!-a[1]!)+a[0]!)result=!result;}return result;}
it('all building label anchors are inside their footprints and outside courtyards',()=>{
 for(const f of campusGeometry.features){if(f.properties.kind!=='building')continue;const point=f.properties.label!;const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 expect(polys.some(poly=>inside(point,poly[0]!)&&!poly.slice(1).some(hole=>inside(point,hole))),f.properties.id).toBe(true);
 }
});
