<script setup lang="ts">
withDefaults(defineProps<{modelValue:boolean;label:string;description?:string;disabled?:boolean}>(),{disabled:false});
const emit=defineEmits<{'update:modelValue':[value:boolean]}>();
</script>
<template><label class="ui-switch" :class="{'is-disabled':disabled}"><input type="checkbox" role="switch" :checked="modelValue" :disabled="disabled" @change="emit('update:modelValue',($event.target as HTMLInputElement).checked)"/><span class="ui-switch-track" aria-hidden="true"><i></i></span><span><b>{{label}}</b><small v-if="description">{{description}}</small></span></label></template>
