<script setup lang="ts">
import dashboardOff from '../assets/side-menu/dashboard-off.svg';
import dashboardOn from '../assets/side-menu/dashboard-on.svg';
import bookOff from '../assets/side-menu/book-off.svg';
import bookOn from '../assets/side-menu/book-on.svg';
import mapOff from '../assets/side-menu/map-off.svg';
import mapOn from '../assets/side-menu/map-on.svg';
import graduationOff from '../assets/side-menu/graduation-cap-off.svg';
import graduationOn from '../assets/side-menu/graduation-cap-on.svg';
import calendarOff from '../assets/side-menu/calendar-off.svg';
import calendarOn from '../assets/side-menu/calendar-on.svg';
import hotelOff from '../assets/side-menu/hotel-off.svg';
import hotelOn from '../assets/side-menu/hotel-on.svg';
import flaskOff from '../assets/side-menu/flask-off.svg';
import flaskOn from '../assets/side-menu/flask-on.svg';
import walletOff from '../assets/side-menu/wallet-off.svg';
import walletOn from '../assets/side-menu/wallet-on.svg';
import chartOff from '../assets/side-menu/bar-chart-off.svg';
import chartOn from '../assets/side-menu/bar-chart-on.svg';
import slideshowOff from '../assets/side-menu/slideshow-off.svg';
import slideshowOn from '../assets/side-menu/slideshow-on.svg';
import brushOff from '../assets/side-menu/brush-ai-off.svg';
import brushOn from '../assets/side-menu/brush-ai-on.svg';

const props=defineProps<{name:string}>();
const icons:Record<string,{off:string;on:string}>={
 dashboard:{off:dashboardOff,on:dashboardOn},book:{off:bookOff,on:bookOn},map:{off:mapOff,on:mapOn},
 graduation:{off:graduationOff,on:graduationOn},calendar:{off:calendarOff,on:calendarOn},hotel:{off:hotelOff,on:hotelOn},
 flask:{off:flaskOff,on:flaskOn},wallet:{off:walletOff,on:walletOn},chart:{off:chartOff,on:chartOn},
 slideshow:{off:slideshowOff,on:slideshowOn},brush:{off:brushOff,on:brushOn}
};
</script>

<template>
  <span class="side-menu-icon" aria-hidden="true">
    <span
      class="side-menu-icon-layer side-menu-icon-off"
      :style="{'--side-menu-icon':`url(&quot;${icons[props.name]?.off||dashboardOff}&quot;)`}"
    />
    <span
      class="side-menu-icon-layer side-menu-icon-on"
      :style="{'--side-menu-icon':`url(&quot;${icons[props.name]?.on||dashboardOn}&quot;)`}"
    />
  </span>
</template>
