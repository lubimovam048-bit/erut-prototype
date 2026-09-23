import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
vi.mock('maplibre-gl',()=>({
 setWorkerUrl:vi.fn(),
 Map:class {container:HTMLElement;constructor(o:{container:HTMLElement}){this.container=o.container;}on(event:string,handler:unknown){if(event==='style.load'&&typeof handler==='function')handler();return this;}stop(){}fitBounds(){}resize(){}remove(){}addSource(){}addLayer(){}getLayer(){return true;}setFilter(){}getSource(){return {setData(){}};}project(p:number[]){return {x:300+(p[0]!-37.6)*500,y:250-(p[1]!-55.8)*500};}},
 Marker:class {element:HTMLElement;constructor(o:{element:HTMLElement}){this.element=o.element;}setLngLat(){return this;}addTo(map:{container:HTMLElement}){map.container.append(this.element);return this;}getElement(){return this.element;}remove(){this.element.remove();}}
}));
import CampusMap from '../../src/components/CampusMap.vue';
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});vi.stubGlobal('matchMedia',()=>({matches:false}));});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();document.body.innerHTML='';});
it('shows a short preview on pointer entry, dismisses it and keeps one campus activation',async()=>{
 const p=mount(CampusMap,{attachTo:document.body});await nextTick();await nextTick();
 const pin=p.get('[aria-label="Открыть кампус: Основной кампус на Образцова"]');
 pin.element.dispatchEvent(new Event('pointerenter'));await vi.advanceTimersByTimeAsync(170);await nextTick();
 expect(p.get('[role="tooltip"]').text()).toContain('98');expect(p.get('[role="tooltip"]').text()).toContain('общая площадь');expect(pin.attributes('aria-describedby')).toBeTruthy();
 await pin.trigger('keydown',{key:'Escape'});expect(p.find('[role="tooltip"]').exists()).toBe(false);
 await pin.get('.campus-badge-name').trigger('click');expect(p.emitted('campus')).toEqual([['obraztsova']]);p.unmount();
});
it('supports keyboard previews and clears them when leaving a campus',async()=>{
 const p=mount(CampusMap);await nextTick();await nextTick();const pin=p.get('[aria-label="Открыть кампус: РОАТ"]');await pin.trigger('focus');await nextTick();expect(p.get('[role="tooltip"]').text()).toContain('Часовая');
 await p.setProps({campusId:'roat'});await nextTick();expect(p.find('[role="tooltip"]').exists()).toBe(false);p.unmount();
});
