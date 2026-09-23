<script setup lang="ts">
import {UiButton} from './ui';
import { computed } from 'vue';
import Icon from './Icon.vue';
const props=defineProps<{page:number;total:number;size:number;label?:string}>();
const emit=defineEmits<{ 'update:page':[page:number] }>();
const pages=computed(()=>Math.max(1,Math.ceil(props.total/props.size)));
</script>
<template><nav v-if="total>size" class="page-controls" :aria-label="label || 'Страницы списка'">
  <span>{{page*size+1}}–{{Math.min((page+1)*size,total)}} из {{total}}</span>
  <div><UiButton class="icon-btn" :disabled="page===0" aria-label="Предыдущая страница" @click="emit('update:page',page-1)"><Icon name="left"/></UiButton>
  <UiButton v-for="n in pages" :key="n" :class="{active:page===n-1}" :aria-label="`Страница ${n}`" :aria-current="page===n-1?'page':undefined" @click="emit('update:page',n-1)">{{n}}</UiButton>
  <UiButton class="icon-btn" :disabled="page>=pages-1" aria-label="Следующая страница" @click="emit('update:page',page+1)"><Icon name="chevron"/></UiButton></div>
</nav></template>
