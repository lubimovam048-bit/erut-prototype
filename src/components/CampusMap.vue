<script setup lang="ts">
import {ref,onMounted,onBeforeUnmount,watch,h,render,nextTick,useId} from 'vue';
import * as maplibregl from 'maplibre-gl';
import type {StyleSpecification,GeoJSONSource} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapHoverCard from './MapHoverCard.vue';
import {campusPreview,buildingPreview,institutePreview,pointPreview,constructionPreview,type MapPreview} from '../map-preview';
import InstituteBadge from './InstituteBadge.vue';
import {UiButton} from './ui';
import Icon from './Icon.vue';
import style from '../../data/map-style.json';
import {mapConfig,fmt} from '../data';
import {placeMapLabels,placeAnchoredBadges,type Rect} from '../map-layout';
import {campuses,campusGeometry,buildingGeometry,buildings,campusPoints,construction,circleStyle,campusStudents,campusArea,campusBounds,completionColor,type MapMode,type DetailLayer,type Building,type CampusPoint,type Construction,type Coordinate,type Campus} from '../campus';
maplibregl.setWorkerUrl(workerUrl);
const props=withDefaults(defineProps<{compact?:boolean;campusId?:string;mode?:MapMode;detailLayers?:DetailLayer[];selectedBuildingId?:string}>(),{compact:false,campusId:'',mode:'education',detailLayers:()=>['buildings'],selectedBuildingId:''});
const emit=defineEmits<{campus:[id:string];building:[building:Building];point:[point:CampusPoint];institute:[id:string];construction:[project:Construction]}>();
const el=ref<HTMLElement>();const failed=ref(false);const moving=ref(false);
const hoverPreview=ref<MapPreview|null>(null);const hoverPosition=ref({left:'0px',top:'0px'});const tooltipId=useId();
let hoverTimer:ReturnType<typeof setTimeout>|undefined,hideTimer:ReturnType<typeof setTimeout>|undefined,hoverTarget:HTMLElement|undefined,describedTarget:HTMLElement|undefined;
function hidePreview(){clearTimeout(hoverTimer);clearTimeout(hideTimer);describedTarget?.removeAttribute('aria-describedby');describedTarget=undefined;hoverTarget=undefined;hoverPreview.value=null;}
function deferHide(){clearTimeout(hoverTimer);clearTimeout(hideTimer);hideTimer=setTimeout(hidePreview,100);}
function holdPreview(){clearTimeout(hideTimer);}
async function showPreview(target:HTMLElement,preview:MapPreview){
 if(moving.value||!el.value)return;hidePreview();hoverTarget=target;hoverPreview.value=preview;describedTarget=target.closest('button')??target;describedTarget.setAttribute('aria-describedby',tooltipId);
 await nextTick();if(hoverTarget!==target||!el.value)return;
 const host=el.value.getBoundingClientRect(),anchor=target.getBoundingClientRect(),tip=el.value.parentElement?.querySelector<HTMLElement>('.map-hover-card');const w=tip?.offsetWidth??280,h=tip?.offsetHeight??220;
 const x=anchor.right-host.left+12;const left=x+w<host.width-12?x:Math.max(12,anchor.left-host.left-w-12);
 hoverPosition.value={left:Math.min(left,Math.max(12,host.width-w-12))+'px',top:Math.max(12,Math.min(anchor.top-host.top,host.height-h-12))+'px'};
}
function bindPreview(target:HTMLElement,preview:MapPreview){
 target.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;clearTimeout(hideTimer);clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>showPreview(target,preview),160);});
 target.addEventListener('pointerleave',deferHide);target.addEventListener('focus',()=>showPreview(target,preview));target.addEventListener('blur',deferHide);
 target.addEventListener('keydown',e=>{if(e.key==='Escape'){hidePreview();e.stopPropagation();}});target.addEventListener('click',hidePreview);
}
let map:maplibregl.Map|undefined,observer:ResizeObserver|undefined,ready=false,renderPending=false,frame=0;
const markers:maplibregl.Marker[]=[];
type MapLabel={id:string;coordinate:Coordinate;root:HTMLElement;label:HTMLElement;line:HTMLElement;radius:number;marker?:maplibregl.Marker};
const labels:MapLabel[]=[];
const duration=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420;
function scheduleLayout(){cancelAnimationFrame(frame);frame=requestAnimationFrame(layoutLabels);}
function layoutLabels(){
 if(!map||!el.value)return;
 const width=el.value.clientWidth,height=el.value.clientHeight;
 const obstacles:Rect[]=[];
 if(!props.campusId&&props.mode!=='construction')obstacles.push({x:0,y:height-145,width:250,height:145});
 const placer=!props.campusId&&props.mode!=='construction'?placeAnchoredBadges:placeMapLabels;
 const placements=placer(labels.map(l=>{const p=map!.project(l.coordinate);return {id:l.id,x:p.x,y:p.y,width:l.label.offsetWidth,height:l.label.offsetHeight};}),width,height,obstacles);
 for(const l of labels){l.root.style.visibility='visible';const box=placements.get(l.id);l.label.style.visibility=box?'visible':'hidden';l.line.style.visibility=box?'visible':'hidden';if(!box)continue;
  const p=map.project(l.coordinate),dx=box.x+box.width/2-p.x,dy=box.y+box.height/2-p.y;
  l.label.style.left=dx+'px';l.label.style.top=dy+'px';l.line.style.width=Math.hypot(dx,dy)+'px';l.line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
 }
}
function removeMarkers(){hidePreview();for(const m of markers){m.getElement().querySelectorAll('.building-institute-label').forEach(n=>render(null,n));m.remove();}markers.length=0;labels.length=0;}
function marker(node:HTMLElement,coordinate:Coordinate){if(!map)return;const m=new maplibregl.Marker({element:node}).setLngLat(coordinate).addTo(map);markers.push(m);return m;}
function labelAt(id:string,coordinate:Coordinate,label:HTMLElement,radius=0,root:HTMLElement=document.createElement('div')){
 root.classList.add('map-anchor');root.style.visibility='hidden';label.classList.add('map-floating-label');const line=document.createElement('i');line.className='map-label-line';root.prepend(line);root.append(label);const m=marker(root,coordinate);labels.push({id,coordinate,root,label,line,radius,marker:m});
}
function campusMarker(c:Campus){
 const visual=circleStyle(c,props.mode);
 const button=document.createElement('button');button.type='button';button.className='campus-badge';button.setAttribute('aria-label',`Открыть кампус: ${c.name}`);button.onclick=()=>emit('campus',c.id);
 const circle=document.createElement('span');circle.className='campus-badge-color';circle.setAttribute('aria-hidden','true');circle.style.background=visual.background;
 const text=document.createElement('span');text.className='campus-badge-name';text.textContent=c.name;
 button.append(circle,text);labelAt(c.id,c.center as Coordinate,button);bindPreview(button,campusPreview(c.id));
}
function highlight(id:string){if(!map?.getLayer('rut-building-selected'))return;map.setFilter('rut-building-selected',['==',['get','id'],id]);}
function scheduleFeatures(){if(renderPending)return;renderPending=true;queueMicrotask(()=>{renderPending=false;renderFeatures();});}
function renderFeatures(){
 if(!map||!ready)return;removeMarkers();const selected=campuses.find(c=>c.id===props.campusId);
 const polygons=selected&&props.detailLayers.includes('buildings')?buildings.filter(b=>b.campusId===selected.id&&!b.geometryUnavailable):[];
 (map.getSource('rut-buildings') as GeoJSONSource).setData({type:'FeatureCollection',features:polygons.map(b=>({type:'Feature',properties:{id:b.id,construction:b.construction},geometry:buildingGeometry(b.id)?.geometry??{type:'Polygon',coordinates:[b.polygon]}}))});
 (map.getSource('rut-territory') as GeoJSONSource).setData({type:'FeatureCollection',features:selected&&props.detailLayers.includes('buildings')?campusGeometry.features.filter(f=>f.properties.kind==='territory'&&f.properties.campusId===selected.id):[]});
 if(!selected){
  if(props.mode==='construction')for(const project of construction){
   if(!project.coordinates)continue;
   const card=document.createElement('button');card.type='button';card.className='construction-map-card';card.setAttribute('aria-label',project.name);card.onclick=()=>emit('construction',project);
   const circle=document.createElement('span');circle.className='construction-circle';circle.style.borderColor=completionColor(project.completion);circle.textContent=project.completion===null?'—':project.completion+'%';
   const name=document.createElement('span');name.className='construction-map-name';name.textContent=project.name;card.append(circle,name);labelAt(project.id,project.coordinates,card);bindPreview(card,constructionPreview(project));
  }
  else for(const c of campuses.filter(c=>c.city==='Москва'))campusMarker(c);
 }else{
  for(const b of polygons){const label=document.createElement('div');label.className='building-chip';const name=document.createElement('button');name.type='button';name.textContent=b.name;name.onclick=()=>emit('building',b);label.append(name);bindPreview(name,buildingPreview(b));
   for(const id of b.instituteIds){const button=document.createElement('button');button.type='button';button.className='building-institute-label';render(h(InstituteBadge,{id,symbolOnly:true}),button);button.onclick=()=>emit('institute',id);bindPreview(button,institutePreview(id));label.append(button);}
   label.onmouseenter=()=>highlight(b.id);label.onmouseleave=()=>highlight(props.selectedBuildingId);label.addEventListener('focusin',()=>highlight(b.id));label.addEventListener('focusout',()=>highlight(props.selectedBuildingId));
   const ps=b.polygon.slice(0,-1),coordinate=buildingGeometry(b.id)?.properties.label??[ps.reduce((s,p)=>s+p[0],0)/ps.length,ps.reduce((s,p)=>s+p[1],0)/ps.length] as Coordinate;
   labelAt(b.id,coordinate,label);
  }
  for(const p of campusPoints.filter(p=>p.campusId===selected.id&&props.detailLayers.includes(p.kind))){const button=document.createElement('button');button.type='button';button.className='campus-service-point '+p.kind;button.textContent=p.name;button.onclick=()=>emit('point',p);labelAt(p.id,p.coordinates,button);bindPreview(button,pointPreview(p));}
 }
 highlight(props.selectedBuildingId);scheduleLayout();
}
function fit(animate=true){hidePreview();if(!map||!el.value)return;const c=campuses.find(c=>c.id===props.campusId);map.stop();map.fitBounds(c?campusBounds(c):mapConfig.overviewBounds as [Coordinate,Coordinate],{padding:{top:85,bottom:80,left:Math.min(95,el.value.clientWidth*.15),right:Math.min(95,el.value.clientWidth*.15)},duration:animate?duration():0,maxZoom:17.4});scheduleLayout();}
watch(()=>[props.campusId,props.mode],()=>{scheduleFeatures();fit();});
watch(()=>props.detailLayers,scheduleFeatures,{deep:true});watch(()=>props.selectedBuildingId,id=>highlight(id));
function init(){
 if(!el.value)return;observer?.disconnect();removeMarkers();map?.remove();ready=false;failed.value=false;
 try{
  map=new maplibregl.Map({container:el.value,style:style as unknown as StyleSpecification,center:mapConfig.center as Coordinate,zoom:10,renderWorldCopies:false,interactive:false,attributionControl:false,locale:{'Map.Title':'Карта кампусов РУТ'}});fit(false);
  map.on('style.load',()=>{
   if(!map)return;ready=true;
   map.addSource('rut-territory',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   map.addLayer({id:'rut-territory-fill',type:'fill',source:'rut-territory',paint:{'fill-color':'#397edb','fill-opacity':.055}});
   map.addLayer({id:'rut-territory-line',type:'line',source:'rut-territory',paint:{'line-color':'#7196c4','line-width':1.5,'line-dasharray':[3,3]}});
   map.addSource('rut-buildings',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   map.addLayer({id:'rut-building-fill',type:'fill',source:'rut-buildings',paint:{'fill-color':['case',['get','construction'],'#f4c46e','#649be3'],'fill-opacity':.52}});
   map.addLayer({id:'rut-building-outline',type:'line',source:'rut-buildings',paint:{'line-color':['case',['get','construction'],'#a36d25','#3569af'],'line-width':1.5}});
   map.addLayer({id:'rut-building-selected',type:'line',source:'rut-buildings',filter:['==',['get','id'],''],paint:{'line-color':'#143f99','line-width':3.5}});
   map.on('click','rut-building-fill',e=>{const b=buildings.find(b=>b.id===e.features?.[0].properties.id);if(b)emit('building',b);});
   map.on('mousemove','rut-building-fill',e=>highlight(String(e.features?.[0].properties.id??'')));map.on('mouseleave','rut-building-fill',()=>highlight(props.selectedBuildingId));
   scheduleFeatures();
  });
  map.on('movestart',()=>{moving.value=true;hidePreview();});map.on('moveend',()=>{moving.value=false;scheduleLayout();});
  map.on('error',()=>failed.value=true);map.on('idle',()=>{if(map?.areTilesLoaded())failed.value=false;});
  let previous='';observer=new ResizeObserver(([entry])=>{const size=`${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;if(size===previous)return;previous=size;map?.resize();fit(false);});observer.observe(el.value);
 }catch{failed.value=true;}
}
onMounted(init);onBeforeUnmount(()=>{cancelAnimationFrame(frame);observer?.disconnect();removeMarkers();map?.remove();map=undefined;ready=false;});
</script>
<template><div class="campus-map campus-map-v2" :class="{'is-compact':compact,'is-moving':moving}"><div ref="el" class="map-canvas"></div><MapHoverCard v-if="hoverPreview" :id="tooltipId" :preview="hoverPreview" :style="hoverPosition" @pointerenter="holdPreview" @pointerleave="deferHide"/><div v-if="failed" class="campus-map-error" role="status">Не удалось загрузить часть карты<UiButton size="sm" @click="init">Повторить</UiButton></div><UiButton v-if="!compact" class="map-reset btn" @click="emit('campus','')"><Icon name="reset" :size="16"/>Вся Москва</UiButton><UiButton v-if="!campusId&&mode!=='construction'" class="sochi-inset" @keydown.esc.stop="hidePreview" @mouseenter="showPreview($event.currentTarget as HTMLElement,campusPreview('sochi'))" @mouseleave="deferHide" @focus="showPreview($event.currentTarget as HTMLElement,campusPreview('sochi'))" @blur="deferHide" @click="hidePreview();emit('campus','sochi')"><span class="sochi-dot"></span><span>Сочинский филиал<small>Сочи · Яна Фабрициуса, 26А/1</small></span><Icon name="arrow" :size="16"/></UiButton><details class="map-credits"><summary><Icon name="info" :size="14"/>О карте</summary><div><b>MapLibre GL JS</b><a v-for="credit in mapConfig.attribution" :key="credit.url" :href="credit.url" target="_blank" rel="noopener">{{credit.label}}</a></div></details></div></template>
