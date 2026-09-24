<script setup lang="ts">
import type {Program,Metric} from '../../admissions';
import {metricUnits} from '../../admissions';
import {fmt} from '../../data';
import InstituteBadge from '../InstituteBadge.vue';
import {UiButton} from '../ui';
import Icon from '../Icon.vue';
defineProps<{items:Program[];college?:boolean}>();
const emit=defineEmits<{program:[program:Program];department:[short:string]}>();
</script>
<template><div class="ad-program-list"><div v-for="(p,index) in items" :key="p.id" class="ad-program-row"><span class="ad-rank">{{String(index+1).padStart(2,'0')}}</span><div class="ad-program-copy"><UiButton class="ad-program-name" @click="emit('program',p)">{{p.name}}<Icon name="arrow" :size="16"/></UiButton><UiButton class="ad-department-link" @click="emit('department',p.institute)"><span v-if="college">{{p.institute}}</span><InstituteBadge v-else :id="p.institute"/></UiButton><small v-if="p.level">{{p.level}}</small></div><strong v-if="p.value!==undefined">{{fmt(p.value)}}<small>{{metricUnits[p.metric as Metric]}}</small></strong><span v-else class="ad-new">Новая</span></div><p v-if="!items.length" class="ad-empty">В доступном рейтинге нет записей для этого подразделения. Это не означает нулевой набор. Полный перечень программ и их показатели не предоставлены.</p></div></template>
