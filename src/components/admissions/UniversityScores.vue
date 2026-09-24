<script setup lang="ts">
import {rules} from '../../admissions';
import {fmt} from '../../data';
</script>
<template>
 <div class="university-scores" role="img" aria-label="Средний балл ЕГЭ по вузам железнодорожного транспорта, бюджет, 2026">
  <div v-for="(university,index) in rules.quality.universities" :key="university.name" class="university-score" :class="{'is-rut':index===0}">
   <div class="university-score-track"><div class="university-score-bar" :style="{height:university.value+'%','--score':university.value+'%'}"><b>{{fmt(university.value)}}</b></div></div>
   <span>{{university.name}}</span>
  </div>
 </div>
</template>
<style scoped>
.university-scores{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:10px;margin:10px 0 18px;min-width:0}
.university-score{min-width:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:165px 36px;gap:8px;text-align:center}
.university-score-track{display:flex;align-items:flex-end;border-bottom:1px solid #d8e3f3}
.university-score-bar{position:relative;width:100%;border-radius:7px 7px 0 0;background:linear-gradient(#438de0,#2f74c8);min-height:28px}
.university-score-bar b{position:absolute;bottom:8px;left:0;right:0;color:white;font-size:13px;font-variant-numeric:tabular-nums}
.university-score>span{font-size:12px;line-height:1.3;color:#607895;overflow-wrap:anywhere}
.is-rut .university-score-bar{background:linear-gradient(#235fc7,#194996)}
.is-rut>span{font-weight:700;color:#204c8e}
@media(max-width:760px){
 .university-scores{grid-template-columns:1fr;gap:9px;margin-top:16px}
 .university-score{display:grid;grid-template-columns:95px minmax(0,1fr);grid-template-rows:24px;align-items:center;gap:12px;text-align:left}
 .university-score>span{grid-column:1;grid-row:1;font-size:13px}
 .university-score-track{grid-column:2;height:24px;border:0;align-items:center}
 .university-score-bar{height:24px!important;width:var(--score);border-radius:5px;min-height:0}
 .university-score-bar b{bottom:3px;text-align:right;padding-right:8px}
}
</style>
