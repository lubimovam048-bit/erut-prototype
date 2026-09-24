<script setup lang="ts">
import {computed} from 'vue';
import {rules} from '../../admissions';
import {fmt} from '../../data';
import Icon from '../Icon.vue';
const universities=rules.quality.universities;
const leader=universities[0]!;
const average=computed(()=>universities.reduce((sum,item)=>sum+item.value,0)/universities.length);
const nearestGap=computed(()=>leader.value-universities[1]!.value);
const averageGap=computed(()=>leader.value-average.value);
function height(value:number){return 34+(value-55)/(leader.value-55)*66;}
</script>
<template>
 <div class="university-comparison" role="img" aria-label="Средний балл ЕГЭ по вузам железнодорожного транспорта, бюджет, 2026">
  <div class="university-plot">
   <div class="university-average" :style="{bottom:height(average)+'%'}"><span>{{fmt(average)}} · среднее</span></div>
   <div class="university-scores">
    <div v-for="(university,index) in universities" :key="university.name" class="university-score" :class="{'is-rut':index===0}">
     <div class="university-score-track">
      <span v-if="index===0" class="university-leader" :style="{bottom:`calc(${height(university.value)}% + 28px)`}"><Icon name="trophy" :size="13"/>Лидер</span>
      <b :style="{bottom:`calc(${height(university.value)}% + 7px)`}">{{fmt(university.value)}}</b>
      <i :style="{height:height(university.value)+'%'}"></i>
     </div>
     <span>{{university.name}}</span>
    </div>
   </div>
  </div>
  <div class="university-summary">
   <div class="university-summary-leader"><span><Icon name="trophy" :size="22"/></span><p><strong>{{leader.name}} — 1 место</strong><small>среди транспортных вузов</small></p></div>
   <div><strong>+{{fmt(nearestGap)}}</strong><small>к ближайшему вузу</small></div>
   <div><strong>+{{fmt(averageGap)}}</strong><small>к среднему значению</small></div>
  </div>
 </div>
</template>
<style scoped>
.university-comparison{display:grid;grid-template-rows:auto auto;align-content:space-between;gap:16px;min-width:0;padding-top:18px}
.university-plot{position:relative;min-width:0;height:340px;padding-top:8px}
.university-scores{position:absolute;inset:0;display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:7px;min-width:0}
.university-score{display:grid;grid-template-rows:minmax(0,1fr) 34px;gap:7px;min-width:0;text-align:center}
.university-score-track{position:relative;border-bottom:1px solid #d9e4f3}
.university-score-track>i{position:absolute;right:0;bottom:0;left:0;min-height:30px;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#dbe8fa,#bfd3ee)}
.university-score-track>b{position:absolute;right:0;left:0;z-index:2;color:#173665;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.university-score>span{overflow-wrap:anywhere;color:#617a9e;font-size:10px;line-height:1.25}
.university-score.is-rut .university-score-track>i{background:linear-gradient(180deg,#4387f2,#1761dc);box-shadow:0 0 14px #2c73e443}
.university-score.is-rut .university-score-track>b,.university-score.is-rut>span{color:#163d7c;font-weight:650}
.university-leader{position:absolute;left:50%;z-index:3;display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:9px;background:#e8f0ff;color:#1761dc;font-size:9px;font-weight:650;transform:translateX(-50%);white-space:nowrap}
.university-average{position:absolute;right:0;left:0;z-index:4;border-top:1px dashed #75a2e7;pointer-events:none}
.university-average span{position:absolute;right:0;bottom:5px;padding:4px 6px;border-radius:7px;background:#f1f5fc;color:#58729a;font-size:9px;white-space:nowrap}
.university-summary{display:grid;grid-template-columns:1.45fr .8fr .8fr;overflow:hidden;border-radius:14px;background:#f5f8fd}
.university-summary>div{display:flex;min-width:0;align-items:center;gap:8px;padding:12px;border-left:1px solid #dce6f4}
.university-summary>div:first-child{border-left:0}
.university-summary-leader>span{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border-radius:12px;background:#e9f1ff;color:#2269db}
.university-summary p,.university-summary small{margin:0!important}
.university-summary p{display:grid;gap:3px}
.university-summary strong{color:#173868;font-size:14px;font-weight:600;line-height:1.2}
.university-summary>div:not(:first-child){display:grid;gap:3px;align-content:center}
.university-summary>div:not(:first-child)>strong{color:#12a56b;font-size:22px}
.university-summary small{color:#7188aa;font-size:10px!important;line-height:1.25}
@media(max-width:760px){
 .university-plot{height:270px;overflow-x:auto}
 .university-scores{min-width:560px}
 .university-average{min-width:560px}
 .university-summary{grid-template-columns:1fr 1fr}
 .university-summary-leader{grid-column:1/-1}
}
</style>
