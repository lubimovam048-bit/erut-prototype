<script setup lang="ts">
import Icon from '../Icon.vue';
import UiButton from './UiButton.vue';
defineProps<{label?:string;value?:string|number;unit?:string;icon?:string;interactive?:boolean}>();
</script>
<template><component :is="interactive?UiButton:'div'" class="kpi ui-metric"><slot name="heading"><span>{{label}}<Icon v-if="icon" :name="icon"/></span></slot><slot name="content"><strong>{{value}}<em v-if="unit">{{unit}}</em><slot name="visual"/></strong></slot><slot name="detail"><small v-if="$slots.default"><slot/></small></slot></component></template>
