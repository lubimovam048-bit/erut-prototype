<script setup lang="ts" generic="T extends string | number">
import {nextTick,ref} from 'vue';
import UiButton from './UiButton.vue';

const props=defineProps<{modelValue:T;items:{value:T;label:string;disabled?:boolean}[];label:string}>();
const emit=defineEmits<{'update:modelValue':[value:T]}>();const root=ref<HTMLElement>();
async function move(event:KeyboardEvent){
 const enabled=props.items.filter(i=>!i.disabled);if(!enabled.length)return;
 const index=enabled.findIndex(i=>i.value===props.modelValue);let target=index;
 if(event.key==='ArrowRight'||event.key==='ArrowDown')target=(index+1)%enabled.length;
 else if(event.key==='ArrowLeft'||event.key==='ArrowUp')target=(index-1+enabled.length)%enabled.length;
 else if(event.key==='Home')target=0;else if(event.key==='End')target=enabled.length-1;else return;
 event.preventDefault();emit('update:modelValue',enabled[target].value);await nextTick();root.value?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus();
}
</script>
<template><nav ref="root" class="focus-tabs ui-tabs" :aria-label="label" @keydown="move"><UiButton v-for="item in items" :key="item.value" :class="{active:modelValue===item.value}" :disabled="item.disabled" :aria-pressed="modelValue===item.value" :tabindex="modelValue===item.value?0:-1" @click="emit('update:modelValue',item.value)">{{item.label}}</UiButton></nav></template>
