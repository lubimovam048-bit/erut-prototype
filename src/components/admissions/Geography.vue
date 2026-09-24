<script setup lang="ts">
import {admissions as a,fmt} from '../../data';
import type {Level} from '../../admissions';
import {computed} from 'vue';
import {UiButton} from '../ui';
const props=defineProps<{level:Level}>();const emit=defineEmits<{region:[name:string]}>();
const groups=computed(()=>props.level==='ВО'?[{name:'Москва и МО',value:a.moscow,share:66},{name:'Другие регионы',value:a.otherRegions,share:34}]:[{name:'Москва и МО',value:a.college.moscow,share:82},{name:'Другие регионы',value:a.college.otherRegions,share:18}]);
const total=computed(()=>groups.value.reduce((sum,item)=>sum+item.value,0));
const maxRegion=computed(()=>Math.max(...a.regions.map(item=>item.value),1));
</script>
<template>
 <div class="ad-geography">
  <div class="ad-geo-overview">
   <div class="ad-geo-donut" :style="{'--local-share':groups[0]!.share+'%'}"><div><strong>{{fmt(total)}}</strong><span>всего<br>зачисленных</span></div></div>
   <div class="ad-geo-groups"><UiButton v-for="(g,index) in groups" :key="g.name" @click="emit('region',g.name)"><i :class="{'is-other':index===1}"></i><span>{{g.name}}</span><b>{{fmt(g.value)}} <small>чел.</small></b><strong>{{g.share}}%</strong></UiButton></div>
  </div>
  <div v-if="level==='ВО'" class="ad-regions"><h3>Топ-5 регионов вне Москвы и МО</h3><UiButton v-for="(r,index) in a.regions" :key="r.name" @click="emit('region',r.name)"><em>{{String(index+1).padStart(2,'0')}}</em><span>{{r.name}}<i><u :style="{width:r.value/maxRegion*100+'%'}"></u></i></span><b>{{r.value}}</b></UiButton></div>
  <p v-else class="ad-empty">Разбивка по отдельным регионам для СПО не предоставлена.</p>
 </div>
</template>
<style scoped>
.ad-geography{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;align-items:start}
.ad-geo-overview{display:grid;grid-template-columns:150px minmax(0,1fr);align-items:center;gap:18px}
.ad-geo-donut{width:150px;aspect-ratio:1;display:grid;place-items:center;border-radius:50%;background:conic-gradient(#2c72ec 0 var(--local-share),#20aaa4 var(--local-share) 100%);transform:rotate(2deg)}
.ad-geo-donut:before{content:"";grid-area:1/1;width:104px;aspect-ratio:1;border-radius:50%;background:#fff}
.ad-geo-donut>div{grid-area:1/1;z-index:1;display:grid;gap:4px;text-align:center;transform:rotate(-2deg)}
.ad-geo-donut strong{color:#173868;font-size:28px;font-weight:450;letter-spacing:-.8px}
.ad-geo-donut span{color:#7188aa;font-size:11px;line-height:1.25}
.ad-geo-groups{display:grid;gap:10px}
.ad-geo-groups button{display:grid;grid-template-columns:11px minmax(0,1fr);gap:2px 8px;padding:9px 10px;border-radius:11px;background:#f6f9fd;text-align:left}
.ad-geo-groups button:hover{background:#f0f5fc}
.ad-geo-groups i{grid-row:1 / span 3;width:9px;height:9px;margin-top:4px;border-radius:50%;background:#2c72ec}
.ad-geo-groups i.is-other{background:#20aaa4}
.ad-geo-groups span{color:#173868;font-size:12px}
.ad-geo-groups b{color:#173868;font-size:20px;font-weight:500;letter-spacing:-.4px}
.ad-geo-groups small{color:#7188aa;font-size:10px;font-weight:400}
.ad-geo-groups strong{color:#2670e8;font-size:17px;font-weight:600}
.ad-geo-groups button:nth-child(2)>strong{color:#1ba49e}
.ad-regions{display:grid;gap:5px;padding-top:14px;border-top:1px solid #e2e9f3}
.ad-regions h3{margin:0 0 5px;color:#173868;font-size:16px;font-weight:550}
.ad-regions button{display:grid;grid-template-columns:34px minmax(0,1fr) 28px;align-items:center;gap:9px;width:100%;padding:5px 0;text-align:left}
.ad-regions button:hover span{color:#2466cd}
.ad-regions em{width:34px;height:30px;display:grid;place-items:center;border-radius:9px;background:#f1f5fb;color:#6f84a3;font-size:11px;font-style:normal}
.ad-regions span{display:grid;gap:5px;min-width:0;color:#173868;font-size:12px;transition:color .15s}
.ad-regions span>i{height:6px;overflow:hidden;border-radius:99px;background:#e8eef6}
.ad-regions span u{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#377bea,#68a0f4);text-decoration:none}
.ad-regions b{color:#173868;font-size:13px;text-align:right}
@media(max-width:520px){.ad-geo-overview{grid-template-columns:1fr}.ad-geo-donut{margin:auto}}
</style>
