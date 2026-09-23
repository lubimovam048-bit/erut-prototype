import { createApp } from 'vue';
import App from './Root.vue';
import '@fontsource-variable/golos-text';
import './style.css';
import './focus.css';
import './design/ui.css';
import './design/system.css';
import { applyDesignTokens } from './design/tokens';
applyDesignTokens();
createApp(App).mount('#app');

import './design/navigation.css';
import './design/layout.css';

import './design/campus.css';
