<script setup lang="ts">
import {useId} from 'vue';
defineOptions({inheritAttrs:false});
withDefaults(defineProps<{modelValue?:string;label?:string;hint?:string;error?:string;type?:string;disabled?:boolean}>(),{modelValue:'',type:'text'});
const emit=defineEmits<{'update:modelValue':[value:string]}>();const id=useId();
</script>
<template><div class="ui-field" :class="{'has-error':error,'is-disabled':disabled}"><label v-if="label" :for="id">{{label}}</label><div class="ui-input-shell"><span v-if="$slots.prefix" class="ui-field-prefix"><slot name="prefix"/></span><input :id="id" v-bind="$attrs" :type="type" :value="modelValue" :disabled="disabled" :aria-invalid="error?true:undefined" :aria-describedby="error||hint?id+'-note':undefined" @input="emit('update:modelValue',($event.target as HTMLInputElement).value)"/><slot name="suffix"/></div><p v-if="error||hint" :id="id+'-note'" class="ui-field-note" :role="error?'alert':undefined">{{error||hint}}</p></div></template>
