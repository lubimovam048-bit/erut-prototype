<script setup lang="ts">
defineProps<{title?:string;description?:string}>();
</script>
<template><section class="panel ui-panel"><header v-if="title||$slots.header" class="panel-head"><slot name="header"><div><h2>{{title}}</h2><p v-if="description">{{description}}</p></div></slot><slot name="action"/></header><slot/><footer v-if="$slots.footer" class="ui-panel-footer"><slot name="footer"/></footer></section></template>
