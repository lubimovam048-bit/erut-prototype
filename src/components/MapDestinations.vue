<script setup lang="ts">
import navigation from '../../data/map-navigation.json';
import {UiButton} from './ui';
import Icon from './Icon.vue';
defineEmits<{navigate:[id:string]}>();
</script>
<template><nav class="map-destinations" aria-label="Разделы университета"><UiButton v-for="item in navigation" :key="item.id" @click="$emit('navigate',item.id)"><span class="map-destination-icon"><Icon :name="item.icon" :size="22"/></span><span><b>{{item.title}}</b><small>{{item.description}}</small></span><Icon name="chevron" :size="16"/></UiButton></nav></template>
