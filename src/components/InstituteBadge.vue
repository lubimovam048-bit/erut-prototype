<script setup lang="ts">
import { computed } from 'vue';
import { institutes } from '../data';
import { instituteIdentity, instituteStyle } from '../identity';
import Icon from './Icon.vue';
const props = withDefaults(defineProps<{ id: string; symbolOnly?: boolean; large?: boolean }>(), { symbolOnly: false, large: false });
const institute = computed(() => institutes.find(i => i.id === props.id || i.short === props.id));
</script>
<template>
  <span class="institute-badge" :class="{'symbol-only':symbolOnly,large}" :style="instituteStyle(id)" :title="institute?.name" :aria-label="symbolOnly ? institute?.short : undefined">
    <span class="institute-symbol"><Icon :name="instituteIdentity(id).icon" :size="large?34:19"/></span>
    <span v-if="!symbolOnly" class="institute-short">{{institute?.short || id}}</span>
  </span>
</template>
