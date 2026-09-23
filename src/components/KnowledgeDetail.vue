<script setup lang="ts">
import {computed,ref,watch,nextTick} from 'vue';
import {UiBadge,UiButton,UiMetric,UiTabs} from './ui';
import Icon from './Icon.vue';
import type {Dossier,KnowledgeLink,KnowledgeRow} from '../knowledge';
const props=withDefaults(defineProps<{topic:Dossier;initialSection?:number;embedded?:boolean}>(),{initialSection:0});
const emit=defineEmits<{navigate:[link:KnowledgeLink];section:[index:number]}>();
const active=ref(props.initialSection);const content=ref<HTMLElement>();
watch(()=>[props.topic.id,props.initialSection],()=>active.value=props.initialSection);
watch(active,async index=>{emit('section',index);await nextTick();if(content.value)content.value.scrollTop=0;});
const section=computed(()=>props.topic.sections[active.value]??props.topic.sections[0]);
function rowLink(row:KnowledgeRow):KnowledgeLink|null {if(row.topic)return {label:row.label,id:row.topic,kind:'topic'};if(row.institute)return {label:row.label,id:row.institute,kind:'institute'};if(row.object)return {label:row.label,id:row.object,kind:'object'};return null;}
</script>
<template><article class="knowledge-detail" :class="{'knowledge-embedded':embedded}"><header class="knowledge-header"><UiBadge tone="info">Сентябрь 2026 · {{embedded?'Университет':'Подробный обзор'}}</UiBadge><h2>{{topic.title}}</h2><p>{{topic.summary}}</p></header><div v-if="topic.metrics.length" class="knowledge-metrics"><UiMetric v-for="metric in topic.metrics" :key="metric.label" :label="metric.label" :value="metric.value"/></div><UiTabs v-if="topic.sections.length>1" v-model="active" label="Разделы подробного обзора" :items="topic.sections.map((s,index)=>({value:index,label:s.title}))"/><section ref="content" class="knowledge-section" :aria-label="section.title"><h3>{{section.title}}</h3><div class="knowledge-rows"><component :is="rowLink(row)?UiButton:'div'" v-for="(row,index) in section.rows" :key="topic.id+'-'+active+'-'+index" class="knowledge-row" :class="{'knowledge-row-link':!!rowLink(row)}" @click="rowLink(row)&&emit('navigate',rowLink(row)!)"><div><b>{{row.label}}</b><p v-if="row.description">{{row.description}}</p></div><strong v-if="row.value">{{row.value}}</strong><Icon v-if="rowLink(row)" name="arrow" :size="18"/></component></div></section><footer v-if="topic.related.length" class="knowledge-related"><span>Продолжить изучение</span><UiButton v-for="item in topic.related" :key="item.kind+item.id" variant="secondary" size="sm" @click="emit('navigate',item)">{{item.label}}<Icon name="right" :size="16"/></UiButton></footer></article></template>
