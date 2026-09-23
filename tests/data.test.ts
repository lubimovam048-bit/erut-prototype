import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = (name:string) => JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const institutes = read('institutes') as {id:string;objectId:string;students:number;enrolled:number;source:number}[];
const objects = read('objects') as {id:string;image:string;coordinates:number[];source:number}[];
const events = read('events') as {id:string;start:string|null;end:string|null;source:number}[];
test('Institute relationships resolve to real campus assets and source pages',()=>{
 assert.equal(new Set(institutes.map(i=>i.id)).size,10);
 for(const i of institutes){assert.ok(objects.some(o=>o.id===i.objectId));assert.ok(i.students>=i.enrolled);}
 for(const o of objects){assert.ok(existsSync(new URL(`../public/${o.image.replace(/^\.?\//,'')}`,import.meta.url)));assert.equal(o.coordinates.length,2);assert.ok(o.coordinates[0]>=-180&&o.coordinates[0]<=180);assert.ok(o.coordinates[1]>=-90&&o.coordinates[1]<=90);}
 for(const r of [...institutes,...objects,...events]){assert.ok(existsSync(new URL(`../public/slides/page-${String(r.source).padStart(2,'0')}.webp`,import.meta.url)));}
});
test('Events preserve date precision and valid multi-day intervals',()=>{
 assert.equal(events.length,9);assert.equal(new Set(events.map(e=>e.id)).size,events.length);
 for(const e of events){if(e.start){assert.ok(e.end&&e.end>=e.start);assert.ok(!Number.isNaN(Date.parse(e.start)));}else assert.equal(e.end,null);}
 const forum=events.find(e=>e.id==='forum')!;assert.equal(forum.start,'2026-09-30');assert.equal(forum.end,'2026-10-01');
 assert.equal(events.filter(e=>e.start===null).length,2);
});
test('Admission totals reconcile only within their published scope',()=>{
 const a=read('admissions');assert.equal(a.moscow+a.otherRegions,a.enrolled);
 assert.equal(a.college.moscow+a.college.otherRegions,a.college.enrolled);
 assert.equal(a.college.institutes.reduce((sum:number,i:{enrolled:number})=>sum+i.enrolled,0),1386);
 assert.equal(a.enrollmentHistory.at(-1),a.enrolled);
 assert.equal(a.scoreHistory.at(-1),a.score);
 assert.equal(read('science').funding.reduce((sum:number,r:{value:number})=>sum+r.value,0),read('science').total);
});
test('Source inconsistencies remain explicit rather than silently corrected',()=>{
 const f=read('finance');assert.equal(f.incomeItems.reduce((sum:number,r:{value:number})=>sum+r.value,0),23039);
 assert.equal(f.income,22919);assert.equal(f.expenses,22620);assert.ok(f.note.includes('23 039'));
});
test('Moscow overview assets fit the configured bounds and labels use Russian fields',()=>{
 const config=read('map-config');const style=read('map-style');
 const visible=objects.filter(o=>!config.excludedObjectIds.includes(o.id));assert.equal(visible.length,18);
 const [[west,south],[east,north]]=config.maxBounds;
 for(const o of visible){assert.ok(o.coordinates[0]>=west&&o.coordinates[0]<=east&&o.coordinates[1]>=south&&o.coordinates[1]<=north,o.id);}
 for(const layer of style.layers){if(layer.type==='symbol'&&layer.layout?.['text-field']&&layer['source-layer']!=='housenumber'){
  assert.deepEqual(layer.layout['text-field'],['coalesce',['get','name:ru'],['get','name_ru'],['get','name'],'']);
 }}
});
test('Each institute has one unique, readable identity regardless of sorting or view',()=>{
 const identities=read('institute-identities') as Record<string,{icon:string;color:string;soft:string}>;
 assert.deepEqual(Object.keys(identities).sort(),institutes.map(i=>i.id).sort());
 assert.equal(new Set(Object.values(identities).map(i=>i.color)).size,10);
 assert.equal(new Set(Object.values(identities).map(i=>i.icon)).size,10);
 const luminance=(hex:string)=>{const rgb=hex.slice(1).match(/../g)!.map(c=>Number.parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const [id,i] of Object.entries(identities)){
  assert.match(i.color,/^#[\da-f]{6}$/i);assert.match(i.soft,/^#[\da-f]{6}$/i);
  assert.ok((luminance(i.soft)+.05)/(luminance(i.color)+.05)>=4.5,`${id}: readable text on tinted background`);
  assert.ok(1.05/(luminance(i.color)+.05)>=4.5,`${id}: white icon on solid background`);
 }
});
test('Expanded dossiers have valid drill-down destinations across all content pages',()=>{
 const topics=read('knowledge');const ids=new Set(topics.map((t:{id:string})=>t.id));assert.equal(ids.size,topics.length);
 const routes=new Set(['home','university','map','admissions','calendar','institutes','science','finance','projects','design']);
 for(const t of topics){
  assert.ok(t.sections.length&&t.sections.every((s:{rows:unknown[]})=>s.rows.length),t.id);
  assert.ok(t.source>=3&&t.source<=21,t.id);
  for(const section of t.sections)for(const r of section.rows){if(r.topic)assert.ok(ids.has(r.topic),r.topic);if(r.object)assert.ok(objects.some(o=>o.id===r.object),r.object);if(r.institute)assert.ok(institutes.some(i=>i.id===r.institute),r.institute);}
  for(const link of t.related){const valid=link.kind==='topic'?ids.has(link.id):link.kind==='object'?objects.some(o=>o.id===link.id):link.kind==='institute'?institutes.some(i=>i.id===link.id):routes.has(link.id);assert.ok(valid,`${t.id} → ${link.id}`);}
 }
 for(let page=3;page<=21;page++)assert.ok(topics.some((t:{source:number})=>t.source===page)||[3,5].includes(page),`coverage of page ${page}`);
 const a=read('admissions');assert.equal(a.newPrograms.length,9);assert.equal(a.college.programs.length,6);assert.equal(read('research-projects').length,12);
 for(const c of a.college.institutes)for(const id of c.objectIds)assert.ok(objects.some(o=>o.id===id));
});
test('Research shares and calendar participant details remain consistent in linked dossiers',()=>{
 const topics=read('science').topics;assert.ok(Math.abs(topics.reduce((n:number,t:{value:number})=>n+t.value,0)-100)<.001);
 assert.equal(topics.find((t:{name:string})=>t.name==='Общетранспортные проблемы').value,26.3);
 const anniversary=read('knowledge').find((t:{id:string})=>t.id==='anniversary');const rows=anniversary.sections[0].rows;
 for(const e of read('events'))assert.ok(rows.find((r:{label:string;description:string})=>r.label===e.title)?.description.includes(e.description));
 assert.ok(!rows.find((r:{label:string})=>r.label==='Форум транспортного образования').description.includes('Фальков'));
});
test('Campus population reconciles and invented detail remains explicitly marked',()=>{
 const campuses=read('campuses');const rows=read('campus-population');const detail=read('campus-detail');
 assert.equal(campuses.length,9);assert.ok(campuses.some((c:{id:string})=>c.id==='sochi'));
 assert.equal(rows.reduce((s:number,r:{onsite:number;remote:number})=>s+r.onsite+r.remote,0),32085);
 assert.equal(rows.reduce((s:number,r:{onsite:number})=>s+r.onsite,0),23296);
 for(const r of rows)assert.ok(campuses.some((c:{id:string})=>c.id===r.campusId));
 for(const b of detail.buildings){assert.equal(b.mock,b.mockFields.length>0);if(!b.mock)assert.ok(b.geometrySource);assert.deepEqual(b.polygon[0],b.polygon.at(-1));for(const id of b.instituteIds)assert.ok(institutes.some(i=>i.id===id));}
 for(const p of detail.points){assert.equal(p.mock,true);assert.equal(p.videoUrl,null);}
 assert.equal(detail.construction.length,4);
 for(const p of detail.construction){assert.equal(p.mock,true);assert.ok(p.mockFields.includes('Процент готовности'));assert.ok(p.completion>=0&&p.completion<=100);}
});
test('Open-map geometry preserves courtyards, separate territory polygons and source identity',()=>{
 const geo=read('campus-geometry');const detail=read('campus-detail');
 assert.equal(geo.type,'FeatureCollection');assert.equal(geo.features.filter((f:{properties:{kind:string}})=>f.properties.kind==='building').length,26);
 assert.ok(geo.features.find((f:{id:string})=>f.id==='rail-1').geometry.coordinates.length>1,'main building courtyards are holes');
 assert.equal(geo.features.find((f:{id:string})=>f.id==='obraztsova-territory').geometry.type,'MultiPolygon');
 for(const f of geo.features){
  assert.match(f.properties.source.url,/^https:\/\/www.openstreetmap.org\/(way|relation)\/\d+$/);
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  for(const polygon of polys)for(const ring of polygon){assert.ok(ring.length>=4);assert.deepEqual(ring[0],ring.at(-1));for(const point of ring)assert.ok(point.every(Number.isFinite));}
  if(f.properties.kind==='building'){const b=detail.buildings.find((b:{id:string})=>b.id===f.id);assert.ok(b);assert.ok(!b.mockFields.includes('Контур и расположение'));assert.equal(b.geometrySource.url,f.properties.source.url);}
 }
});

test('Every campus has sourced geometry and unknown outlines stay off the map',()=>{
 const geo=read('campus-geometry');const detail=read('campus-detail');
 for(const c of read('campuses'))assert.ok(geo.features.some((f:{properties:{campusId:string;kind:string}})=>f.properties.campusId===c.id&&f.properties.kind==='building'),c.id);
 for(const b of detail.buildings){if(!b.geometrySource)assert.equal(b.geometryUnavailable,true,b.id);}
});
