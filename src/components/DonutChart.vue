<script setup lang="ts">
import {UiButton} from './ui';
import {computed,ref,watch} from 'vue';
import {fmt} from '../data';
const props=withDefaults(defineProps<{items:{name:string;value:number;color?:string}[];unit?:string;label?:string;showShares?:boolean}>(),{unit:'',label:'Всего',showShares:true});
const hovered=ref<number|null>(null);
const selected=ref<number|null>(null);
const active=computed(()=>hovered.value??selected.value);
watch(()=>props.items.map(i=>i.name).join('\0'),()=>{hovered.value=null;selected.value=null;});
const colors=['#326aee','#15958e','#8064cf','#ae731d','#5d83bb'];
const total=computed(()=>props.items.reduce((sum,i)=>sum+Math.max(0,i.value),0));
const circumference=2*Math.PI*84;
const segments=computed(()=>{
 let offset=0;
 return props.items.map((item,i)=>{
  const share=total.value>0?Math.max(0,item.value)/total.value:0;
  const length=share*circumference;
  const result={...item,share,length,offset,color:item.color||colors[i%colors.length]};
  offset+=length;return result;
 });
});
</script>
<template>
 <div class="donut-chart">
  <div class="donut-layout">
   <div class="donut-plot">
    <svg viewBox="0 0 220 220" role="img" :aria-label="items.map(i=>`${i.name}: ${fmt(i.value)} ${unit}`).join(', ')">
     <circle cx="110" cy="110" r="84" fill="none" stroke="#edf1f7" stroke-width="22"/>
     <circle v-for="(segment,index) in segments" :key="segment.name" class="donut-segment" cx="110" cy="110" r="84" fill="none" :stroke="segment.color" stroke-width="22" :stroke-dasharray="`${Math.max(segment.length-4,0)} ${circumference-Math.max(segment.length-4,0)}`" :stroke-dashoffset="-segment.offset" transform="rotate(-90 110 110)" :opacity="active===null||active===index?1:.6" @mouseenter="hovered=index" @mouseleave="hovered=null"/>
    </svg>
    <div class="donut-center"><strong :class="{'donut-number-long':fmt(total).length>6}">{{fmt(total)}}</strong><span>{{unit||label}}</span></div>
   </div>
   <div class="donut-legend">
    <UiButton v-for="(item,index) in segments" :key="item.name" :class="{active:active===index}" :aria-pressed="selected===index" @mouseenter="hovered=index" @mouseleave="hovered=null" @focus="hovered=index" @blur="hovered=null" @click="selected=selected===index?null:index">
     <i :style="{background:item.color}"></i><span>{{item.name}}</span><div class="donut-value"><b>{{fmt(item.value)}}{{unit==='%'?'%':''}}</b><span v-if="showShares&&unit!=='%'">{{fmt(item.share*100)}}%</span></div>
    </UiButton>
   </div>
  </div>
 </div>
</template>
<style scoped>
.donut-chart{container-type:inline-size;width:100%;min-width:0}
.donut-layout{display:grid;grid-template-columns:188px minmax(0,1fr);gap:18px;align-items:center;padding:4px 0;min-width:0}
.donut-plot{width:188px;height:188px;position:relative;justify-self:center;flex-shrink:0}
.donut-plot svg{display:block;width:100%;height:100%;overflow:visible}
.donut-segment{transition:opacity 140ms;cursor:pointer}
.donut-center{position:absolute;inset:26%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center;pointer-events:none}
.donut-center strong{font-size:29px;line-height:1.1;font-weight:650;letter-spacing:-.8px;color:var(--institute-color,var(--er-color-text));font-variant-numeric:tabular-nums;white-space:nowrap}
.donut-center strong.donut-number-long{font-size:23px;letter-spacing:-.5px}
.donut-center>span{font-size:13px;line-height:1.35;color:var(--er-color-muted);max-width:110px}
.donut-legend{display:flex;flex-direction:column;gap:5px;min-width:0}
.donut-legend>button{display:grid;grid-template-columns:9px minmax(0,1fr) auto;align-items:center;gap:10px;text-align:left;padding:11px 10px;border-radius:12px;min-height:58px;min-width:0;width:100%;border:1px solid transparent}
.donut-legend>button.active{background:var(--er-color-primary-soft);border-color:#dce5f8}
.donut-legend>button>i{width:9px;height:9px;border-radius:3px}
.donut-legend>button>span{font-size:15px;line-height:1.4;color:var(--er-color-muted);overflow-wrap:anywhere}
.donut-value{text-align:right;display:flex;flex-direction:column;gap:3px}
.donut-value>b{font-size:17px;font-weight:600;line-height:1.3;color:var(--institute-color,var(--er-color-text));font-variant-numeric:tabular-nums;white-space:nowrap}
.donut-value>b>small{margin-left:4px;font-size:12px;font-weight:400;color:var(--er-color-muted)}
.donut-value>span{font-size:13px;line-height:1.3;font-variant-numeric:tabular-nums;color:var(--er-color-muted)}
@container (min-width:351px) and (max-width:520px){.donut-layout{grid-template-columns:160px minmax(0,1fr);gap:10px}.donut-plot{width:160px;height:160px}.donut-center{inset:23%}.donut-center strong{font-size:25px}.donut-center strong.donut-number-long{font-size:22px}.donut-legend>button{padding:5px;min-height:42px;gap:7px}.donut-legend>button>span{font-size:14px}.donut-value>b{font-size:16px}.donut-value>b>small{display:block;margin-left:0}}
@container(max-width:350px){.donut-layout{grid-template-columns:minmax(0,1fr);gap:8px}.donut-legend{width:100%}.donut-plot{width:188px;height:188px}}
@media(prefers-reduced-motion:reduce){.donut-segment{transition:none}}
</style>
