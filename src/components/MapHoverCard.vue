<script setup lang="ts">
import type {MapPreview} from '../map-preview';
defineProps<{preview:MapPreview;id:string}>();
</script>
<template><section :id="id" class="map-hover-card" role="tooltip"><span class="map-hover-eyebrow">{{preview.eyebrow}}</span><h3>{{preview.title}}</h3><p v-if="preview.address" class="map-hover-address">{{preview.address}}</p><div v-if="preview.metrics.length" class="map-hover-metrics"><div v-for="m in preview.metrics" :key="m.label"><b>{{m.value}}</b><span>{{m.label}}</span></div></div><p v-if="preview.detail" class="map-hover-detail">{{preview.detail}}</p><footer>{{preview.hint}}</footer></section></template>
