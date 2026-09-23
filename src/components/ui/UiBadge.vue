<script setup lang="ts">
withDefaults(defineProps<{tone?:'neutral'|'info'|'success'|'warning'|'danger';dot?:boolean}>(),{tone:'info',dot:false});
</script>
<template><span class="badge ui-badge" :class="`ui-badge--${tone}`"><i v-if="dot" aria-hidden="true"></i><slot/></span></template>
