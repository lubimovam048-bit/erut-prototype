<script setup lang="ts">
import {UiButton,UiSelect,UiBadge,UiPanel, UiTabs} from './ui';
import {ref,computed,watch} from 'vue';
import {events,type UniversityEvent} from '../data';
import Icon from './Icon.vue';
import PageControls from './PageControls.vue';
const emit=defineEmits<{event:[event:UniversityEvent]}>();
const month=ref(8);const year=ref(2026);const mode=ref('list');const category=ref('Все события');const listPage=ref(0);const selectedDay=ref('');
const categories=['Все события','Образование','Строительство','Культура','Маркетинг'];
const title=computed(()=>new Date(year.value,month.value,1).toLocaleDateString('ru',{month:'long',year:'numeric'}).replace(' г.',''));
const filtered=computed(()=>events.filter(e=>category.value==='Все события'||e.category===category.value));
const cells=computed(()=>{
 const offset=(new Date(year.value,month.value,1).getDay()+6)%7;
 const length=Math.ceil((offset+new Date(year.value,month.value+1,0).getDate())/7)*7;
 return Array.from({length},(_,i)=>{const d=new Date(year.value,month.value,i-offset+1);const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return {dateLabel:d.toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'}),day:d.getDate(),current:d.getMonth()===month.value,iso,events:filtered.value.filter(e=>e.start&&e.end&&e.start<=iso&&e.end>=iso)};});
});
const monthEvents=computed(()=>filtered.value.filter(e=>{const period=`${year.value}-${String(month.value+1).padStart(2,'0')}`;return e.start?(e.start<=period+'-31'&&e.end!>=period+'-01'):!!(e.startMonth&&e.endMonth&&e.startMonth<=period&&e.endMonth>=period);}));
const dayEvents=computed(()=>selectedDay.value?filtered.value.filter(e=>e.start&&e.end&&e.start<=selectedDay.value&&e.end>=selectedDay.value):monthEvents.value);
const dayTitle=computed(()=>selectedDay.value?new Date(selectedDay.value+'T12:00:00').toLocaleDateString('ru',{day:'numeric',month:'long'}):'В этом месяце');
watch(category,()=>{listPage.value=0;selectedDay.value='';});
function move(n:number){const d=new Date(year.value,month.value+n);year.value=d.getFullYear();month.value=d.getMonth();selectedDay.value='';}
</script>
<template>
 <div class="page-toolbar calendar-toolbar">
  <UiTabs v-model="mode" label="Вид календаря" :items="[{value:'list',label:'События'},{value:'month',label:'Месяц'}]"/>
  <div v-if="mode==='month'" class="month-switch"><UiButton class="icon-btn" aria-label="Предыдущий месяц" @click="move(-1)"><Icon name="left"/></UiButton><h2>{{title}}</h2><UiButton class="icon-btn" aria-label="Следующий месяц" @click="move(1)"><Icon name="chevron"/></UiButton></div>
  <span v-else class="calendar-context">130-летие университета · 2026</span>
  <UiSelect v-model="category" aria-label="Категория событий"><option v-for="c in categories" :key="c">{{c}}</option></UiSelect>
 </div>
 <template v-if="mode==='list'">
  <div class="event-list focus-event-list"><UiButton v-for="e in filtered.slice(listPage*4,(listPage+1)*4)" :key="e.id" class="event-list-item" @click="emit('event',e)"><div class="event-date">{{e.dateLabel}}<small>2026</small></div><div><UiBadge class="badge">{{e.category}}</UiBadge><h3>{{e.title}}</h3><p>{{e.location}}</p></div><Icon name="arrow"/></UiButton><p v-if="!filtered.length" class="empty">Событий в этой категории нет.</p></div>
  <PageControls v-model:page="listPage" :total="filtered.length" :size="4" label="Страницы событий"/>
 </template>
 <div v-else class="calendar-stage">
  <section class="calendar-grid" :style="{'--calendar-rows':cells.length/7}"><div v-for="d in ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС']" :key="d" class="weekday">{{d}}</div><UiButton v-for="c in cells" :key="c.iso" class="calendar-cell focus-day" :class="{muted:!c.current,today:c.iso==='2026-09-23',selected:selectedDay===c.iso}" :aria-label="`${c.dateLabel}, событий: ${c.events.length}`" :aria-pressed="selectedDay===c.iso" @click="selectedDay=c.iso"><span class="day-number">{{c.day}}</span><span v-if="c.events.length" class="day-events-count">{{c.events.length}} {{c.events.length===1?'событие':'события'}}</span></UiButton></section>
  <UiPanel class="panel period-events"><div class="panel-head"><h2>{{dayTitle}}</h2><UiButton v-if="selectedDay" class="subtle-link" @click="selectedDay=''">Весь месяц</UiButton></div><div class="calendar-agenda"><UiButton v-for="e in dayEvents" :key="e.id" class="calendar-agenda-item" @click="emit('event',e)"><span>{{e.dateLabel}}</span><b>{{e.title}}</b><small>{{e.category}}</small></UiButton><p v-if="!dayEvents.length" class="empty">Нет событий на этот {{selectedDay?'день':'месяц'}}.</p></div><UiButton class="subtle-link" @click="month=8;year=2026;selectedDay=''">К сентябрю 2026 <Icon name="reset" :size="15"/></UiButton></UiPanel>
 </div>
</template>
