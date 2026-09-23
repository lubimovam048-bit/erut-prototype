<script setup lang="ts">
import Icon from '../Icon.vue';
withDefaults(defineProps<{title:string;description?:string;icon?:string}>(),{icon:'search'});
</script>
<template><div class="ui-empty"><span class="ui-empty-icon"><Icon :name="icon" :size="28"/></span><h3>{{title}}</h3><p v-if="description">{{description}}</p><slot/></div></template>
