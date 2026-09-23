<script setup lang="ts">
import {ref,watch} from 'vue';
import {UiButton,UiSelect,UiBadge} from './ui';
import Icon from './Icon.vue';
const page=defineModel<number>({required:true});const enlarged=ref(false);const stage=ref<HTMLElement>();
watch(page,()=>{enlarged.value=false;if(stage.value){stage.value.scrollTop=0;stage.value.scrollLeft=0;}});
</script>
<template><div class="presentation-viewer"><header class="presentation-toolbar"><div><UiBadge>Документ · сентябрь 2026</UiBadge><h2>Текущий статус деятельности РУТ (МИИТ)</h2></div><div class="presentation-controls"><UiButton variant="secondary" size="sm" :disabled="page===1" aria-label="Предыдущий слайд" @click="page--"><Icon name="left"/></UiButton><UiSelect v-model="page" aria-label="Страница презентации"><option v-for="n in 21" :key="n" :value="n">{{n}} / 21</option></UiSelect><UiButton variant="secondary" size="sm" :disabled="page===21" aria-label="Следующий слайд" @click="page++"><Icon name="chevron"/></UiButton><UiButton variant="secondary" size="sm" :aria-pressed="enlarged" @click="enlarged=!enlarged"><Icon :name="enlarged?'expand':'plus'"/>{{enlarged?'Вписать целиком':'Увеличить'}}</UiButton><a class="btn" href="./source.pdf" target="_blank" rel="noopener" aria-label="Открыть PDF">PDF <Icon name="external" :size="16"/></a></div></header><div ref="stage" class="presentation-stage" :class="{'is-enlarged':enlarged}"><img class="source-image" :src="`./slides/page-${String(page).padStart(2,'0')}.webp`" :alt="`Страница ${page} презентации`"/></div></div></template>
