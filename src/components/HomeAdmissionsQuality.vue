<script setup lang="ts">
import {computed,onBeforeUnmount,ref,watch} from 'vue';
import Icon from './Icon.vue';
import UiButton from './ui/UiButton.vue';
import {fmt} from '../data';

const props=defineProps<{
  mode:'score'|'enrolled';
  years:number[];
  scoreValues:number[];
  enrollmentValues:number[];
}>();
const emit=defineEmits<{ 'update:mode':[value:'score'|'enrolled'] }>();

const host=ref<HTMLElement>();
const width=ref(900);
const height=ref(310);
let observer:ResizeObserver|undefined;

watch(host,element=>{
  observer?.disconnect();
  if(element&&typeof ResizeObserver!=='undefined'){
    observer=new ResizeObserver(([entry])=>{
      width.value=Math.max(entry.contentRect.width,320);
      height.value=Math.max(entry.contentRect.height,220);
    });
    observer.observe(element);
  }
},{flush:'post'});
onBeforeUnmount(()=>observer?.disconnect());

const isScore=computed(()=>props.mode==='score');
const values=computed(()=>isScore.value?props.scoreValues:props.enrollmentValues);
const nationalScoreValues=[58,60.3,63.9,67.7];
const nationalEnrollmentValues=[6580,6690,6840,6980];
const ticks=computed(()=>isScore.value?[55,60,65,70,75,80]:[6500,6700,6900,7100,7300]);
const low=computed(()=>ticks.value[0]!);
const high=computed(()=>ticks.value.at(-1)!);
const left=50;
const right=15;
const top=16;
const bottom=38;
const plotBottom=computed(()=>height.value-bottom);
const plotWidth=computed(()=>width.value-left-right);
const plotHeight=computed(()=>plotBottom.value-top);
const dataLeft=computed(()=>left+plotWidth.value*.067);
const dataWidth=computed(()=>plotWidth.value*.866);
const xAt=(index:number)=>dataLeft.value+index*dataWidth.value/(Math.max(props.years.length-1,1));
const yAt=(value:number)=>top+(high.value-value)/(high.value-low.value)*plotHeight.value;
const points=computed(()=>values.value.map((value,index)=>({x:xAt(index),y:yAt(value),value})));
const nationalPoints=computed(()=>(isScore.value?nationalScoreValues:nationalEnrollmentValues).map((value,index)=>({x:xAt(index),y:yAt(value),value})));
const linePath=(items:{x:number;y:number}[])=>items.map((point,index)=>`${index?'L':'M'}${point.x},${point.y}`).join(' ');
const primaryLine=computed(()=>linePath(points.value));
const comparisonLine=computed(()=>linePath(nationalPoints.value));
const areaPath=computed(()=>`${primaryLine.value} L${points.value.at(-1)?.x??dataLeft.value},${plotBottom.value} L${dataLeft.value},${plotBottom.value} Z`);
const lastPoint=computed(()=>points.value.at(-1));
const gradientId='home-admission-quality-area';
const displayValue=computed(()=>isScore.value?'76,4':fmt(props.enrollmentValues.at(-1)??0));
const badge=computed(()=>isScore.value?'+4,2%':'−104');
const isDecrease=computed(()=>!isScore.value);
</script>

<template>
  <section class="home-admission-quality">
    <header class="home-admission-quality__header">
      <div>
        <h2>{{isScore?'Качество приема':'Динамика приема'}}</h2>
        <p>{{isScore?'Средний балл ЕГЭ · бюджет':'Зачислено · все формы обучения'}}</p>
      </div>
      <div class="home-admission-quality__controls">
        <div class="home-admission-quality__tabs" role="tablist" aria-label="Показатель приёма">
          <UiButton role="tab" :aria-selected="isScore" :class="{active:isScore}" @click="emit('update:mode','score')">Балл ЕГЭ</UiButton>
          <UiButton role="tab" :aria-selected="!isScore" :class="{active:!isScore}" @click="emit('update:mode','enrolled')">Прием</UiButton>
        </div>
        <div class="home-admission-quality__legend">
          <span><i></i>РУТ (МИИТ)</span>
          <span><i></i>Среднее по РФ</span>
        </div>
      </div>
    </header>

    <div class="home-admission-quality__metric">
      <strong>{{displayValue}}</strong>
      <span :class="{'is-negative':isDecrease}"><Icon :name="isDecrease?'downArrow':'up'" :size="18"/>{{badge}}</span>
    </div>

    <div ref="host" class="home-admission-quality__chart">
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${isScore?'Средний балл ЕГЭ':'Зачислено'} за 2023–2026 годы`">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#4f91e8" stop-opacity=".54"/>
            <stop offset="1" stop-color="#dcecff" stop-opacity=".46"/>
          </linearGradient>
        </defs>

        <g class="home-admission-quality__grid">
          <line v-for="tick in ticks" :key="tick" :x1="left" :x2="width-right" :y1="yAt(tick)" :y2="yAt(tick)"/>
          <line v-for="(_,index) in years" :key="index" :x1="xAt(index)" :x2="xAt(index)" :y1="top" :y2="plotBottom"/>
        </g>
        <line class="home-admission-quality__axis" :x1="left" :x2="width-right" :y1="plotBottom" :y2="plotBottom"/>
        <line class="home-admission-quality__axis" :x1="left" :x2="left" :y1="top" :y2="plotBottom"/>

        <text v-for="tick in ticks" :key="`label-${tick}`" class="home-admission-quality__tick" :x="left-12" :y="yAt(tick)+5" text-anchor="end">{{fmt(tick)}}</text>
        <text v-for="(year,index) in years" :key="year" class="home-admission-quality__year" :x="xAt(index)" :y="height-8" text-anchor="middle">{{year}}</text>

        <path class="home-admission-quality__area" :d="areaPath" :fill="`url(#${gradientId})`"/>
        <path class="home-admission-quality__comparison-line" :d="comparisonLine"/>
        <circle v-for="(point,index) in nationalPoints" :key="`national-${index}`" class="home-admission-quality__comparison-point" :cx="point.x" :cy="point.y" r="5"/>
        <path class="home-admission-quality__primary-line" :d="primaryLine"/>

        <g v-for="(point,index) in points" :key="`primary-${index}`">
          <circle v-if="index===points.length-1" class="home-admission-quality__halo" :cx="point.x" :cy="point.y" r="13"/>
          <circle class="home-admission-quality__primary-point" :class="{'is-last':index===points.length-1}" :cx="point.x" :cy="point.y" :r="index===points.length-1?8:5"/>
          <text v-if="index<points.length-1" class="home-admission-quality__point-label" :x="point.x" :y="point.y-13" text-anchor="middle">{{fmt(point.value)}}</text>
        </g>

        <g v-if="lastPoint" class="home-admission-quality__tooltip" :transform="`translate(${lastPoint.x-31} ${lastPoint.y-62})`">
          <rect width="62" height="40" rx="8"/>
          <path d="M23 40L31 50L39 40Z"/>
          <text x="31" y="27" text-anchor="middle">{{fmt(lastPoint.value)}}</text>
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.home-admission-quality{display:flex;flex-direction:column;height:100%;min-height:0;color:#213957}
.home-admission-quality__header{display:flex;justify-content:space-between;align-items:flex-start;gap:22px;flex-shrink:0}
.home-admission-quality__header h2{font-size:24px!important;line-height:1.25!important;font-weight:550;margin:0;color:#213957}
.home-admission-quality__header p{margin:10px 0 0!important;font-size:16px!important;line-height:1.35!important;color:#657a99!important}
.home-admission-quality__controls{display:flex;flex-direction:column;align-items:flex-end;gap:11px;flex-shrink:0}
.home-admission-quality__tabs{display:flex;gap:2px;padding:5px;background:#eaf0f9;border-radius:14px}
.home-admission-quality__tabs button{padding:7px 13px;border-radius:9px;color:#94a7bf;font-size:15px;line-height:1.2;white-space:nowrap}
.home-admission-quality__tabs button.active{background:#fff;color:#2d66d8;box-shadow:0 1px 4px rgba(45,102,216,.06)}
.home-admission-quality__legend{display:flex;align-items:center;gap:22px;color:#657a99;font-size:14px;white-space:nowrap}
.home-admission-quality__legend span{display:flex;align-items:center;gap:7px}
.home-admission-quality__legend i{width:12px;height:12px;border-radius:50%;background:#2f66d8}
.home-admission-quality__legend span:nth-child(2) i{background:#9bacc2}
.home-admission-quality__metric{display:flex;align-items:center;gap:14px;margin:17px 0 5px;flex-shrink:0}
.home-admission-quality__metric strong{color:#2e64d2;font-size:44px;line-height:1;font-weight:500;letter-spacing:-1px}
.home-admission-quality__metric span{display:flex;align-items:center;gap:4px;padding:9px 12px;border-radius:999px;background:#e2f4ed;color:#11664d;font-size:15px;font-weight:500;white-space:nowrap}
.home-admission-quality__metric span.is-negative{background:#fbecef;color:#b43b54}
.home-admission-quality__chart{flex:1;min-height:220px;width:100%;overflow:hidden}
.home-admission-quality__chart svg{display:block;width:100%;height:100%;overflow:visible;font-family:'Golos Text Variable',sans-serif}
.home-admission-quality__grid line{stroke:#d8e3f2;stroke-width:1;stroke-dasharray:3 4}
.home-admission-quality__axis{stroke:#cedbef;stroke-width:1}
.home-admission-quality__tick,.home-admission-quality__year{fill:#637898;font-size:14px;font-weight:400}
.home-admission-quality__area{stroke:none}
.home-admission-quality__comparison-line{fill:none;stroke:#91a5be;stroke-width:1.5;stroke-dasharray:6 6}
.home-admission-quality__comparison-point{fill:#9bacc2;stroke:#fff;stroke-width:1.5}
.home-admission-quality__primary-line{fill:none;stroke:#2f66d8;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.home-admission-quality__primary-point{fill:#fff;stroke:#2f66d8;stroke-width:2}
.home-admission-quality__primary-point.is-last{stroke:#fff;stroke-width:3}
.home-admission-quality__halo{fill:#2f66d8;opacity:.18}
.home-admission-quality__point-label{fill:#263c5c;font-size:14px;font-weight:500}
.home-admission-quality__tooltip rect,.home-admission-quality__tooltip path{fill:#2f66d8}
.home-admission-quality__tooltip text{fill:#fff;font-size:16px;font-weight:400}
@media(max-width:760px){
 .home-admission-quality__header{flex-direction:column;gap:14px}
 .home-admission-quality__controls{width:100%;align-items:flex-start}
 .home-admission-quality__legend{gap:14px;font-size:13px;flex-wrap:wrap;white-space:normal}
 .home-admission-quality__header h2{font-size:21px!important}
 .home-admission-quality__header p{font-size:14px!important;margin-top:6px!important}
 .home-admission-quality__metric{margin-top:14px}
 .home-admission-quality__metric strong{font-size:38px}
 .home-admission-quality__chart{min-height:240px}
}
</style>
