<script setup lang="ts">
import {admissions as a,fmt} from '../../data';
import type {Level} from '../../admissions';
import {computed} from 'vue';
import {UiButton} from '../ui';
const props=defineProps<{level:Level}>();const emit=defineEmits<{region:[name:string]}>();
const groups=computed(()=>props.level==='ВО'?[{name:'Москва и МО',value:a.moscow,share:66},{name:'Другие регионы',value:a.otherRegions,share:34}]:[{name:'Москва и МО',value:a.college.moscow,share:82},{name:'Другие регионы',value:a.college.otherRegions,share:18}]);
</script>
<template><div class="ad-geography"><div><div class="ad-geo-bar" aria-hidden="true"><span :style="{width:groups[0]!.share+'%'}"></span><span :style="{width:groups[1]!.share+'%'}"></span></div><div class="ad-geo-groups"><UiButton v-for="g in groups" :key="g.name" @click="emit('region',g.name)"><span>{{g.name}}</span><b>{{fmt(g.value)}} <small>чел.</small></b><strong>{{g.share}}%</strong></UiButton></div></div><div v-if="level==='ВО'" class="ad-regions"><p>Топ-5 регионов вне Москвы и МО</p><UiButton v-for="r in a.regions" :key="r.name" @click="emit('region',r.name)"><span>{{r.name}}</span><b>{{r.value}}</b></UiButton></div><p v-else class="ad-empty">Разбивка по отдельным регионам для СПО не предоставлена.</p></div></template>
