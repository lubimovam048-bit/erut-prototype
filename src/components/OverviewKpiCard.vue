<script setup lang="ts">
import { useId } from 'vue';
import Icon from './Icon.vue';
import UiMetric from './ui/UiMetric.vue';

withDefaults(defineProps<{
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

const chartId=useId().replace(/:/g,'');
const lineGradientId=`overview-kpi-line-${chartId}`;
const barGradientId=`overview-kpi-bars-${chartId}`;
</script>

<template>
  <UiMetric
    interactive
    class="overview-kpi"
    :class="`overview-kpi--${tone}`"
    @click="$emit('activate')"
  >
    <template #heading><span class="overview-kpi__title">{{title}}</span></template>
    <template #content>
      <strong class="overview-kpi__value">
        {{value}}<em v-if="unit">{{unit}}</em>
      </strong>
      <span class="overview-kpi__trend"><Icon name="up" :size="14"/>{{trend}}</span>
    </template>
    <template #detail>
      <small class="overview-kpi__meta"><i></i>{{meta}}</small>
      <small class="overview-kpi__comparison">{{comparison}}</small>
      <svg v-if="chart==='line'" class="overview-kpi__chart overview-kpi__line-chart" viewBox="0 0 150 64" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient :id="lineGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="currentColor" stop-opacity=".34"/>
            <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <g class="overview-kpi__grid">
          <path d="M12 0V64M37 0V64M62 0V64M87 0V64M112 0V64M137 0V64"/>
        </g>
        <path class="overview-kpi__area" d="M3 57C21 47 38 38 56 33C72 29 80 41 93 28C105 17 118 30 145 13V64H3Z" :fill="`url(#${lineGradientId})`"/>
        <path class="overview-kpi__line" d="M3 57C21 47 38 38 56 33C72 29 80 41 93 28C105 17 118 30 145 13"/>
        <circle class="overview-kpi__point" cx="145" cy="13" r="3"/>
      </svg>
      <svg v-else class="overview-kpi__chart overview-kpi__bar-chart" viewBox="0 0 150 64" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient :id="barGradientId" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="currentColor" stop-opacity=".86"/>
            <stop offset="1" stop-color="currentColor" stop-opacity=".16"/>
          </linearGradient>
        </defs>
        <g class="overview-kpi__grid">
          <path d="M12 0V64M37 0V64M62 0V64M87 0V64M112 0V64M137 0V64"/>
        </g>
        <g :fill="`url(#${barGradientId})`">
          <rect x="4" y="44" width="17" height="20" rx="1"/>
          <rect x="25" y="35" width="17" height="29" rx="1"/>
          <rect x="46" y="27" width="17" height="37" rx="1"/>
          <rect x="67" y="18" width="17" height="46" rx="1"/>
          <rect x="88" y="10" width="17" height="54" rx="1"/>
          <rect x="109" y="3" width="17" height="61" rx="1"/>
          <rect x="130" y="0" width="17" height="64" rx="1"/>
        </g>
      </svg>
    </template>
  </UiMetric>
</template>
