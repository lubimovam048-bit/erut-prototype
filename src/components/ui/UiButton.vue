<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'plain'|'primary'|'secondary'|'ghost'|'danger';
  size?: 'sm'|'md'|'lg'; disabled?: boolean; loading?: boolean; type?: 'button'|'submit'|'reset';
}>(),{variant:'plain',size:'md',disabled:false,loading:false,type:'button'});
</script>
<template><button :type="type" class="ui-button" :class="[`ui-button--${variant}`,`ui-button--${size}`,{'is-loading':loading}]" :disabled="disabled||loading" :aria-busy="loading||undefined"><span v-if="loading" class="ui-spinner" aria-hidden="true"></span><slot/></button></template>
