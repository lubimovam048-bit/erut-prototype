import campusData from '../data/campuses.json';
import populationData from '../data/campus-population.json';
import detailData from '../data/campus-detail.json';
import geometryData from '../data/campus-geometry.json';
import type {FeatureCollection,Polygon,MultiPolygon} from 'geojson';
import {objects} from './data';
export type Coordinate=[number,number];
export type MapMode='education'|'students'|'area'|'construction';
export type DetailLayer='buildings'|'gates'|'food'|'cameras';
export type Campus=typeof campusData[number];
export type Building={id:string;campusId:string;name:string;area:number|null;instituteIds:string[];construction:boolean;polygon:Coordinate[];mock:boolean;mockFields:string[];objectId:string|null;geometryUnavailable?:boolean;geometrySource?:{name:string;url:string;date:string;address:string}};
export type CampusPoint={id:string;campusId:string;kind:'gates'|'food'|'cameras';name:string;coordinates:Coordinate;hours:string|null;operator:string|null;videoUrl:string|null;mock:boolean};
export type Construction={id:string;name:string;campusId:string|null;coordinates:Coordinate|null;completion:number|null;year:number;source:number;mock:boolean;mockFields:string[]};
export const campusGeometry=geometryData as FeatureCollection<Polygon|MultiPolygon,{id:string;campusId:string;kind:string;name:string;source:{name:string;url:string;date:string};label?:Coordinate}>;
export const buildingGeometry=(id:string)=>campusGeometry.features.find(f=>f.properties.id===id);
export const campuses=campusData;
export const population=populationData;
export const buildings=detailData.buildings as Building[];
export const campusPoints=detailData.points as CampusPoint[];
export const construction=detailData.construction as Construction[];
export const educationTypes:Record<string,{name:string;color:string}>={school:{name:'Начальное и среднее',color:'#ed774d'},college:{name:'СПО',color:'#46a6ed'},higher:{name:'ВО',color:'#d94f87'}};
export const campusObjects=(id:string)=>objects.filter(o=>campuses.find(c=>c.id===id)?.objectIds.includes(o.id));
export const campusRows=(id?:string)=>id?population.filter(r=>r.campusId===id):population;
export const campusStudents=(id:string):number|null=>{const rows=campusRows(id);return rows.length?rows.reduce((s,r)=>s+r.onsite+r.remote,0):null;};
export const campusArea=(id:string)=>campusObjects(id).reduce((sum,o)=>sum+o.area,0);
export const campusForObject=(id:string)=>campuses.find(c=>c.objectIds.includes(id));
export function circleStyle(c:Campus,mode:MapMode){
 if(mode==='education'){const colors=c.education.map(t=>educationTypes[t].color);return {size:24,background:colors.length>1?`conic-gradient(${colors.map((color,i)=>`${color} ${i/colors.length*100}% ${(i+1)/colors.length*100}%`).join(',')})`:colors[0]??'#7b8da8'};}
 const value=mode==='students'?campusStudents(c.id):campusArea(c.id);if(value===null)return {size:24,background:'#d9e1ec'};
 const maximum=Math.max(...campuses.map(x=>mode==='students'?campusStudents(x.id)??0:campusArea(x.id)));const fraction=Math.sqrt(value/maximum);
 return {size:24+fraction*44,background:`rgb(${Math.round(173-144*fraction)} ${Math.round(218-135*fraction)} ${Math.round(249-61*fraction)})`};
}
export const completionColor=(value:number|null)=>value===null?'#8b9bb0':value<40?'#e15757':value<80?'#e7b438':'#2d9e75';
export function campusBounds(c:Campus):[Coordinate,Coordinate]{
 const detail:Coordinate[]=[...buildings.filter(b=>b.campusId===c.id&&!b.geometryUnavailable).flatMap(b=>b.polygon),...campusGeometry.features.filter(f=>f.properties.campusId===c.id).flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2)) as Coordinate[],...campusPoints.filter(p=>p.campusId===c.id).map(p=>p.coordinates)];
 const coords=detail.length?detail:c.bounds as Coordinate[];
 return [[Math.min(...coords.map(p=>p[0])),Math.min(...coords.map(p=>p[1]))],[Math.max(...coords.map(p=>p[0])),Math.max(...coords.map(p=>p[1]))]];
}
