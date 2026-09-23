<script setup lang="ts">
import {computed,ref,useId,watch,onBeforeUnmount} from 'vue';
import {UiEmptyState} from './ui';
import {fmt} from '../data';
const props=withDefaults(defineProps<{values:number[];labels:(string|number)[];suffix?:string;color?:string}>(),{suffix:'',color:'#2864e8'});
const id=useId();const host=ref<HTMLElement>();const width=ref(580);const height=ref(240);const hovered=ref<number|null>(null);let observer:ResizeObserver|undefined;
watch(()=>[props.values,props.labels],()=>hovered.value=null);
watch(host,element=>{observer?.disconnect();if(element&&typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(([entry])=>{width.value=Math.max(entry.contentRect.width,200);height.value=Math.max(entry.contentRect.height,160);});observer.observe(element);}},{flush:'post'});
onBeforeUnmount(()=>observer?.disconnect());
const range=computed(()=>{
 if(!props.values.length)return {low:0,high:1};
 const min=Math.min(...props.values);const max=Math.max(...props.values);const gap=Math.max((max-min)*.25,Math.abs(max)*.04,.1);
 return {low:min<0?min-gap:Math.max(0,min-gap),high:max+gap};
});
const bottom=computed(()=>height.value-37);
const points=computed(()=>props.values.map((v,index)=>({x:52+index*(width.value-104)/(props.values.length-1||1),y:bottom.value-(v-range.value.low)/(range.value.high-range.value.low)*(bottom.value-48),v})));
const line=computed(()=>points.value.map((p,index)=>`${index?'L':'M'}${p.x},${p.y}`).join(' '));
const activeIndex=computed(()=>hovered.value!==null&&hovered.value<points.value.length?hovered.value:points.value.length-1);
const tooltip=computed(()=>{const p=points.value[activeIndex.value];if(!p)return null;const text=fmt(p.v)+props.suffix;const size=Math.min(width.value-8,Math.max(64,text.length*9+22));return {x:Math.max(4,Math.min(width.value-size-4,p.x-size/2)),y:p.y-39,width:size,text};});
</script>
<template>
 <UiEmptyState v-if="!values.length" title="Нет данных для графика" description="Выберите другой срез или период." icon="trend"/>
 <div v-else ref="host" class="trend-chart">
  <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="labels.map((label,index)=>`${label}: ${values[index]}${suffix}`).join(', ')">
   <defs><linearGradient :id="id+'-fill'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" :stop-color="color" stop-opacity=".2"/><stop offset="100%" :stop-color="color" stop-opacity=".015"/></linearGradient></defs>
   <path v-for="fraction in [0,.5,1]" :key="fraction" :d="`M24 ${bottom-(bottom-48)*fraction} H${width-24}`" stroke="#dce6f6" stroke-dasharray="3 7"/>
   <path :d="`${line} L${points.at(-1)?.x??52} ${bottom} L52 ${bottom} Z`" :fill="`url(#${id}-fill)`"/>
   <path :d="line" fill="none" :stroke="color" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
   <path v-if="points[activeIndex]" :d="`M${points[activeIndex].x} 20 V${bottom}`" :stroke="color" stroke-opacity=".18" stroke-dasharray="4 5"/>
   <g v-for="(p,index) in points" :key="index" tabindex="0" :aria-label="`${labels[index]}: ${fmt(p.v)}${suffix}`" @mouseenter="hovered=index" @mouseleave="hovered=null" @focus="hovered=index" @blur="hovered=null">
    <rect :x="p.x-25" y="10" width="50" :height="height-10" fill="transparent"/>
    <circle v-if="activeIndex===index" :cx="p.x" :cy="p.y" r="12" :fill="color" fill-opacity=".12"/>
    <circle :cx="p.x" :cy="p.y" r="4.5" fill="white" :stroke="color" stroke-width="2.5"/>
    <text :x="p.x" :y="height-9" text-anchor="middle" :fill="activeIndex===index?color:'#596d89'" font-size="14" :font-weight="activeIndex===index?600:450">{{labels[index]}}</text>
    <text v-if="activeIndex!==index" :x="p.x" :y="p.y-17" text-anchor="middle" fill="#496080" font-size="15" font-weight="550">{{fmt(p.v)}}{{suffix}}</text>
   </g>
   <g v-if="tooltip" pointer-events="none"><rect :x="tooltip.x" :y="tooltip.y" :width="tooltip.width" height="29" rx="8" :fill="color"/><text :x="tooltip.x+tooltip.width/2" :y="tooltip.y+20" text-anchor="middle" fill="white" font-size="15" font-weight="600">{{tooltip.text}}</text></g>
  </svg>
 </div>
</template>
<style scoped>
.trend-chart{display:block;width:100%;min-width:0;height:240px;min-height:200px;max-height:280px;flex:1 0 200px;overflow:hidden}
.trend-chart>svg{display:block;width:100%;height:100%;overflow:visible}
.trend-chart g[tabindex]:focus{outline:none}.trend-chart g[tabindex]:focus-visible circle:last-of-type{stroke-width:4}
</style>
