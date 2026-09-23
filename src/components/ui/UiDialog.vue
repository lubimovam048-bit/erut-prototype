<script setup lang="ts">
import {nextTick,onBeforeUnmount,ref,watch} from 'vue';
import UiButton from './UiButton.vue';
import Icon from '../Icon.vue';
defineOptions({inheritAttrs:false});
const props=defineProps<{open:boolean;label:string}>();const emit=defineEmits<{close:[]}>();
const dialog=ref<HTMLElement>();let previous:HTMLElement|null=null;let priorOverflow='';let appRoot:HTMLElement|null=null;let priorInert=false;let active=false;
function keydown(e:KeyboardEvent){
 if(!props.open)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();emit('close');return;}
 if(e.key==='Tab'){
  const elements=Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')||[]).filter(el=>el.getClientRects().length);
  const first=elements[0],last=elements.at(-1);if(!first){e.preventDefault();dialog.value?.focus();return;}
  if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.value)){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
}
function restore(){document.removeEventListener('keydown',keydown,true);document.body.style.overflow=priorOverflow;if(appRoot)appRoot.inert=priorInert;previous?.isConnected&&previous.focus({preventScroll:true});}
watch(()=>props.open,async open=>{
 if(open){active=true;previous=document.activeElement as HTMLElement;priorOverflow=document.body.style.overflow;appRoot=document.getElementById('app');priorInert=appRoot?.inert??false;if(appRoot)appRoot.inert=true;document.body.style.overflow='hidden';document.addEventListener('keydown',keydown,true);await nextTick();dialog.value?.querySelector<HTMLButtonElement>('.modal-close')?.focus();}
 else if(active){restore();active=false;}
},{immediate:true});
watch(()=>props.label,async()=>{await nextTick();if(props.open&&dialog.value){dialog.value.scrollTop=0;dialog.value.querySelectorAll<HTMLElement>('.modal-body,.knowledge-section').forEach(el=>el.scrollTop=0);dialog.value.querySelector<HTMLButtonElement>('.modal-close')?.focus();}});
onBeforeUnmount(()=>{if(props.open)restore();});
</script>
<template><Teleport to="body"><div v-if="open" class="modal-backdrop ui-dialog-backdrop" @click.self="emit('close')"><section ref="dialog" v-bind="$attrs" class="modal ui-dialog" role="dialog" aria-modal="true" :aria-label="label" tabindex="-1"><UiButton class="modal-close icon-btn" aria-label="Закрыть карточку" @click="emit('close')"><Icon name="close" :size="22"/></UiButton><slot/></section></div></Teleport></template>
