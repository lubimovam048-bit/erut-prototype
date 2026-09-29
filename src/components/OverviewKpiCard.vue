<script setup lang="ts">
import { computed } from 'vue';
import UiMetric from './ui/UiMetric.vue';
import featuredArea from '../assets/overview-kpi/featured-area.svg';
import featuredGridHorizontal from '../assets/overview-kpi/featured-grid-horizontal.svg';
import featuredGridVertical from '../assets/overview-kpi/featured-grid-vertical.svg';
import featuredLine from '../assets/overview-kpi/featured-line.svg';
import featuredPoint from '../assets/overview-kpi/featured-point.svg';
import lightGridHorizontal from '../assets/overview-kpi/light-grid-horizontal.svg';
import lightGridVertical from '../assets/overview-kpi/light-grid-vertical.svg';
import purpleArea from '../assets/overview-kpi/purple-area.svg';
import purpleLine from '../assets/overview-kpi/purple-line.svg';
import purplePoint from '../assets/overview-kpi/purple-point.svg';
import bulletBlue from '../assets/overview-kpi/bullet-blue.svg';
import bulletCyan from '../assets/overview-kpi/bullet-cyan.svg';
import bulletPurple from '../assets/overview-kpi/bullet-purple.svg';
import trendUpGreen from '../assets/overview-kpi/trend-up-green.svg';
import trendUpWhite from '../assets/overview-kpi/trend-up-white.svg';

const props=withDefaults(defineProps<{
  title:string;
  value:string;
  unit?:string;
  meta:string;
  trend:string;
  comparison:string;
  tone?:'featured'|'teal'|'purple'|'blue';
  chart?:'line'|'bars';
}>(),{
  unit:'',
  tone:'blue',
  chart:'line',
});

defineEmits<{activate:[]}>();

const bulletIcon=computed(()=>props.tone==='featured'?bulletCyan:props.tone==='purple'?bulletPurple:bulletBlue);
const trendIcon=computed(()=>props.tone==='featured'?trendUpWhite:trendUpGreen);
</script>

<template>
  <UiMetric interactive class="overview-kpi" :class="`overview-kpi--${tone}`" @click="$emit('activate')">
    <template #heading>
      <span class="overview-kpi__copy">
        <span class="overview-kpi__title">{{title}}</span>
        <strong class="overview-kpi__value">{{value}}<em v-if="unit">{{unit}}</em></strong>
        <small class="overview-kpi__meta">
          <span class="overview-kpi__bullet"><img :src="bulletIcon" alt=""/></span>
          <span class="overview-kpi__meta-text">{{meta}}</span>
        </small>
      </span>
    </template>
    <template #content>
      <span class="overview-kpi__visual">
        <span class="overview-kpi__progress">
          <span class="overview-kpi__trend"><img :src="trendIcon" alt=""/>{{trend}}</span>
          <small class="overview-kpi__comparison">{{comparison}}</small>
        </span>

        <span class="overview-kpi__grid-layer" aria-hidden="true">
          <img :src="tone==='featured'?featuredGridVertical:lightGridVertical" alt=""/>
          <span class="overview-kpi__grid-horizontal"><img :src="tone==='featured'?featuredGridHorizontal:lightGridHorizontal" alt=""/></span>
        </span>

        <span v-if="chart==='line' && tone==='featured'" class="overview-kpi__line-visual overview-kpi__line-visual--featured" aria-hidden="true">
          <img class="overview-kpi__chart-area" :src="featuredArea" alt=""/>
          <img class="overview-kpi__chart-line" :src="featuredLine" alt=""/>
          <img class="overview-kpi__chart-point" :src="featuredPoint" alt=""/>
        </span>
        <span v-else-if="chart==='line'" class="overview-kpi__line-visual overview-kpi__line-visual--purple" aria-hidden="true">
          <img class="overview-kpi__chart-area" :src="purpleArea" alt=""/>
          <img class="overview-kpi__chart-line" :src="purpleLine" alt=""/>
          <img class="overview-kpi__chart-point" :src="purplePoint" alt=""/>
        </span>
        <span v-else class="overview-kpi__bars" aria-hidden="true">
          <i v-for="height in [16,24,32,40,48,56,61]" :key="height" :style="{height:`${height/61*100}%`}"></i>
        </span>
      </span>
    </template>
    <template #detail></template>
  </UiMetric>
</template>
