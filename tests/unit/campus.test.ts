import {afterEach,expect,it,vi} from 'vitest';import {mount,flushPromises} from '@vue/test-utils';
vi.mock('../../src/components/CampusMap.vue',()=>({default:{name:'CampusMap',props:['campusId','mode','detailLayers'],emits:['campus','building','point','institute','construction'],template:'<div class="map-test"/>'}}));
import InfrastructureMap from '../../src/components/InfrastructureMap.vue';import CampusPopulation from '../../src/components/CampusPopulation.vue';
import {buildings,campusPoints,campusStudents,campusArea,campuses,circleStyle,campusBounds} from '../../src/campus';
afterEach(()=>{document.body.innerHTML='';});
it('filters the original diagram per campus without mixing admission counts',()=>{const p=mount(CampusPopulation,{props:{campusId:'roat'}});expect(p.findAll('.population-row')).toHaveLength(2);expect(p.text()).toContain('РОАТ');expect(p.text()).toContain('ИСТИ');expect(p.text()).not.toContain('ИЖТ');expect(campusStudents('roat')).toBe(9742);expect(campusStudents('sochi')).toBeNull();expect(campusArea('obraztsova')).toBe(98482);p.unmount();});
it('uses increasing circle sizes and includes every campus object in the selected extent',()=>{
 const main=campuses.find(c=>c.id==='obraztsova')!,med=campuses.find(c=>c.id==='budayskaya')!;expect(circleStyle(main,'students').size).toBeGreaterThan(circleStyle(med,'students').size);
 for(const c of campuses){const [[w,s],[e,n]]=campusBounds(c);for(const p of [...buildings.filter(b=>b.campusId===c.id&&!b.geometryUnavailable).flatMap(b=>b.polygon),...campusPoints.filter(p=>p.campusId===c.id).map(p=>p.coordinates)])expect(p[0]>=w&&p[0]<=e&&p[1]>=s&&p[1]<=n).toBe(true);}
});
it('campus drilldown enables buildings only, opens small cards and preserves institute links',async()=>{
 const p=mount(InfrastructureMap);const map=p.findComponent({name:'CampusMap'});map.vm.$emit('campus','obraztsova');await flushPromises();expect(map.props('campusId')).toBe('obraztsova');expect(map.props('detailLayers')).toEqual(['buildings']);
 const b=buildings.find(b=>b.name==='ГУК-8')!;map.vm.$emit('building',b);await flushPromises();expect(p.get('.map-feature-card').text()).toContain('Контур: OpenStreetMap');expect(p.get('.map-feature-card').text()).toContain('ГУК-8');
 await p.get('.building-institutes button').trigger('click');expect(p.emitted('institute')?.[0]).toEqual([b.instituteIds[0]]);
 await p.findAll('input[type="checkbox"]')[1].setValue(true);expect(map.props('detailLayers')).toContain('gates');map.vm.$emit('point',campusPoints.find(x=>x.campusId==='obraztsova'&&x.kind==='gates'));await flushPromises();expect(p.get('.map-feature-card').text()).toContain('07:00');p.unmount();
});
it('supports Sochi and restores the Moscow overview when a layer changes',async()=>{const p=mount(InfrastructureMap,{props:{initialCampusId:'sochi'}});const map=p.findComponent({name:'CampusMap'});expect(map.props('campusId')).toBe('sochi');await p.findAll('.campus-layer-toolbar button')[3].trigger('click');expect(map.props('campusId')).toBe('');expect(map.props('mode')).toBe('construction');expect(p.findAll('.campus-project-row')).toHaveLength(4);p.unmount();});
it('disconnected camera windows show their status and can be minimized, restored and closed',async()=>{const p=mount(InfrastructureMap,{attachTo:document.body});p.findComponent({name:'CampusMap'}).vm.$emit('point',campusPoints.find(x=>x.kind==='cameras'));await flushPromises();expect(document.querySelector('.camera-window')?.textContent).toContain('Камера не подключена');document.querySelector<HTMLButtonElement>('[aria-label="Свернуть видео"]')!.click();await flushPromises();expect(document.querySelector('.camera-window')).toBeNull();document.querySelector<HTMLButtonElement>('.camera-restore')!.click();await flushPromises();expect(document.querySelector('.camera-window')).not.toBeNull();document.querySelector<HTMLButtonElement>('[aria-label="Закрыть видео"]')!.click();await flushPromises();expect(document.querySelector('.camera-window')).toBeNull();p.unmount();});
it('opens object dossiers and contextual admissions from the map',async()=>{
 const p=mount(InfrastructureMap,{props:{initialCampusId:'obraztsova'}});
 const map=p.findComponent({name:'CampusMap'});const b=buildings.find(b=>b.name==='ГУК-8')!;
 map.vm.$emit('building',b);await flushPromises();await p.get('.map-dossier-link').trigger('click');expect(p.emitted('object')?.[0]).toEqual([b.objectId]);
 await p.findAll('.map-inspector-tabs button')[2].trigger('click');expect(p.findAll('.map-unit-card').length).toBeGreaterThan(0);
 await p.get('.map-unit-admissions').trigger('click');expect(p.emitted('admissions')?.[0]?.[0]).toBeTruthy();p.unmount();
});
it('service discovery activates its layer and campus changes clear old detail',async()=>{
 const p=mount(InfrastructureMap,{props:{initialCampusId:'obraztsova'}});await p.findAll('.map-inspector-tabs button')[3].trigger('click');await p.get('.map-service-row').trigger('click');
 expect(p.findComponent({name:'CampusMap'}).props('detailLayers')).toContain('gates');expect(p.find('.map-feature-card').exists()).toBe(true);
 await p.get('select[aria-label="Перейти к кампусу"]').setValue('sochi');expect(p.find('.map-feature-card').exists()).toBe(false);expect(p.findComponent({name:'CampusMap'}).props('campusId')).toBe('sochi');p.unmount();
});
it('links to platform sections and closes the expanded workspace with Escape',async()=>{
 const p=mount(InfrastructureMap);await p.findAll('[aria-label="Обзор инфраструктуры"] button')[2].trigger('click');await p.get('.map-destinations button').trigger('click');expect(p.emitted('navigate')?.[0]).toEqual(['admissions']);
 await p.get('[aria-label="Развернуть карту"]').trigger('click');expect(p.classes()).toContain('map-expanded');window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));await flushPromises();expect(p.classes()).not.toContain('map-expanded');p.unmount();
});

it('retains the selected campus when switching analytical modes',async()=>{const p=mount(InfrastructureMap,{props:{initialCampusId:'roat'}});await p.findAll('.campus-layer-toolbar button')[1].trigger('click');expect(p.findComponent({name:'CampusMap'}).props('campusId')).toBe('roat');p.unmount();});
