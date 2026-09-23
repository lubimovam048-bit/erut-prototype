<script setup lang="ts">
import {defineAsyncComponent,onMounted,onBeforeUnmount} from 'vue';
import LoginApp from './LoginApp.vue';
import {signedIn,checkSession} from './access';
const App=defineAsyncComponent(()=>import('./App.vue'));
onMounted(()=>{window.addEventListener('focus',checkSession);document.addEventListener('visibilitychange',checkSession);});
onBeforeUnmount(()=>{window.removeEventListener('focus',checkSession);document.removeEventListener('visibilitychange',checkSession);});
</script>
<template><App v-if="signedIn"/><LoginApp v-else/></template>
