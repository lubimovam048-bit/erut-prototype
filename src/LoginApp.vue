<script setup lang="ts">
import {ref} from 'vue';
import {signIn} from './access';
import branding from '../data/login-brand.json';
import UiButton from './components/ui/UiButton.vue';
import UiInput from './components/ui/UiInput.vue';
import Icon from './components/Icon.vue';
const login=ref('');const password=ref('');const showPassword=ref(false);const pending=ref(false);const error=ref('');
function submit(){
 error.value='';
 try{if(!signIn(login.value,password.value))error.value='Неверный логин или пароль.';}
 catch{error.value='Разрешите хранение данных в браузере, чтобы войти.';}
}

</script>
<template><div class="login-screen"><div class="login-art"><div class="brand light"><img :src="'./favicon.svg'" alt=""/><span>RUT.digital<span class="brand-dot">.</span></span></div><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="orbital orbital-one"></div><div class="orbital orbital-two"></div><div class="login-copy"><span class="eyebrow">РУТ (МИИТ)</span><h1>Российский<br>университет<br>транспорта</h1><p>130 лет создаём движение.</p><div class="login-stats"><div v-for="item in branding.metrics" :key="item.label"><b>{{item.value}}</b><span>{{item.label}}</span></div></div></div><div class="login-bottom">Ситуационный центр РУТ (МИИТ)<span>1896 — 2026</span></div></div><div class="login-form-side"><form @submit.prevent="submit"><div class="login-icon"><Icon name="shield" :size="26"/></div><h2>Добро пожаловать в<br>RUT.digital</h2><p>Единая цифровая платформа<br>Российского университета транспорта</p><UiInput v-model="login" label="Логин" autocomplete="username" required :disabled="pending"><template #prefix><Icon name="users"/></template></UiInput><UiInput v-model="password" label="Пароль" :type="showPassword?'text':'password'" autocomplete="current-password" required :disabled="pending"><template #prefix><Icon name="lock"/></template><template #suffix><UiButton class="icon-btn" :aria-label="showPassword?'Скрыть пароль':'Показать пароль'" @click="showPassword=!showPassword"><Icon :name="showPassword?'hidden':'eye'"/></UiButton></template></UiInput><p v-if="error" class="form-error" role="alert">{{error}}</p><UiButton class="btn primary full" type="submit" :loading="pending">Войти в систему <Icon name="right"/></UiButton></form><div class="login-footer">RUT.digital — цифровая среда управления университетом</div></div></div></template>

<style scoped>
.login-form-side form>.ui-field{margin-bottom:20px}.login-form-side form>.btn{margin-top:6px}.login-copy h1{font-size:clamp(36px,4.8vw,64px);overflow-wrap:normal}
.login-copy{padding:42px 0}.login-copy h1{line-height:1.15;letter-spacing:-2px}.login-stats{position:static;flex-direction:row;gap:38px;margin-top:44px}.login-footer{text-align:center;line-height:1.6}.login-bottom{gap:24px}.login-form-side h2{line-height:1.35}
@media(max-width:760px){.login-stats{gap:24px;margin-top:25px;flex-wrap:wrap}.login-copy{padding:30px 0 12px}.login-copy h1{font-size:38px}.login-stats b{font-size:26px}.login-copy p{max-width:none}.login-art{min-height:0}}
</style>
