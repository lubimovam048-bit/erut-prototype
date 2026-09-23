<script setup lang="ts" generic="T extends string | number">
import {useId} from 'vue';
import Icon from '../Icon.vue';
defineOptions({inheritAttrs:false});
const props=defineProps<{modelValue:T;label?:string;hint?:string;disabled?:boolean}>();
const emit=defineEmits<{'update:modelValue':[value:T]}>();const id=useId();
function update(event:Event){const value=(event.target as HTMLSelectElement).value;emit('update:modelValue',(typeof props.modelValue==='number'?Number(value):value) as T);}
</script>
<template><div class="ui-select-field"><label v-if="label" :for="id">{{label}}</label><div class="ui-select-shell"><select :id="id" v-bind="$attrs" :value="modelValue" :disabled="disabled" :aria-describedby="hint?id+'-hint':undefined" @change="update"><slot/></select><Icon name="down" :size="16"/></div><p v-if="hint" :id="id+'-hint'" class="ui-field-note">{{hint}}</p></div></template>
