import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {flushPromises,mount,enableAutoUnmount} from '@vue/test-utils';
import App from '../../src/App.vue';
import CalendarView from '../../src/components/Calendar.vue';
import Admissions from '../../src/components/Admissions.vue';
enableAutoUnmount(afterEach);
beforeEach(()=>{
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
 vi.stubGlobal('scrollTo',vi.fn());
 for(const name of ['localStorage','sessionStorage']) {
  const values=new Map<string,string>();
  vi.stubGlobal(name,{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,String(value)),removeItem:(key:string)=>values.delete(key),clear:()=>values.clear(),key:(index:number)=>[...values.keys()][index]??null,get length(){return values.size;}});
 }
 location.hash='#/institutes';
});
afterEach(()=>{document.body.innerHTML='';vi.unstubAllGlobals();});
it('keeps entity context through institute, campus and college drill-down',async()=>{
 const host=document.createElement('div');host.id='app';document.body.append(host);
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 const wrapper=mount(App,{attachTo:host,global:{stubs:{CampusMap:true,DesignSystem:true}}});await flushPromises();
 expect(wrapper.findAll('.institute-card')).toHaveLength(4);
 await wrapper.get('input[aria-label="Найти институт"]').setValue('ЮИ');expect(wrapper.findAll('.institute-card')).toHaveLength(1);
 await wrapper.get('.institute-card').trigger('click');await flushPromises();expect(document.querySelector('.modal h2')?.textContent).toContain('Юридический');
 const click=async(text:string)=>{const button=[...document.querySelectorAll<HTMLButtonElement>('.modal button')].find(b=>b.textContent?.includes(text));expect(button,text).toBeTruthy();button!.click();await flushPromises();};
 await click('Инфраструктура');document.querySelector<HTMLButtonElement>('.campus-link')!.click();await flushPromises();expect(document.querySelector('.modal h2')?.textContent).toContain('Правовой колледж');
 await click('ПК · программы');expect(document.querySelector('.knowledge-header h2')?.textContent).toContain('Правовой');
 await click('Назад');expect(document.querySelector('.modal h2')?.textContent).toContain('Юридический институт и');
 await click('Назад');expect(document.querySelector('.campus-link')).not.toBeNull();expect(document.querySelector('.detail-tabs [aria-pressed="true"]')?.textContent).toContain('Инфраструктура');
 document.querySelector<HTMLButtonElement>('.modal-close')!.click();await flushPromises();expect(document.querySelector('.modal')).toBeNull();expect(host.inert).toBe(false);
 expect(warn.mock.calls.flat().join(' ')).not.toContain('Failed to resolve component');wrapper.unmount();
});
it('calendar keeps imprecise events inside their published month and year',async()=>{
 const calendar=mount(CalendarView);await calendar.findAll('button').find(b=>b.text()==='Месяц')!.trigger('click');
 expect(calendar.text()).toContain('Популяризация маскота');
 const next=calendar.get('[aria-label="Следующий месяц"]');await next.trigger('click');expect(calendar.text()).toContain('Популяризация маскота');
 await next.trigger('click');expect(calendar.text()).not.toContain('Популяризация маскота');expect(calendar.text()).toContain('Истории личностей');
 await next.trigger('click');await next.trigger('click');expect(calendar.get('.calendar-agenda').text()).toMatch(/[Нн]ет событий/);calendar.unmount();
});
it('admissions export follows the selected population and produces a usable CSV',async()=>{
 let blob:Blob|undefined;let filename='';const create=vi.fn((b:Blob)=>{blob=b;return 'blob:test';});const revoke=vi.fn();vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:create,revokeObjectURL:revoke}));
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){filename=this.download;});
 const page=mount(Admissions);await page.findAll('button').find(b=>b.text()==='Подразделения')!.trigger('click');
 await page.get('select[aria-label="Подразделение"]').setValue('ief');await page.findAll('button').find(b=>b.text().includes('CSV'))!.trigger('click');
 const content=await new Promise<string>(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.readAsText(blob!);});
 expect(content).toContain('ИЭФ;2897;828');expect(content).not.toContain('ИЖТ;');expect(filename).toBe('RUT.digital-прием-2026-ВО-departments.csv');expect(revoke).toHaveBeenCalledWith('blob:test');page.unmount();
});

it('removes global search and persists the Figma sidebar state through its navigation trigger',async()=>{
 const wrapper=mount(App,{global:{stubs:{CampusMap:true,DesignSystem:true}}});await flushPromises();
 expect(wrapper.find('.global-search').exists()).toBe(false);
 await wrapper.get('.sidebar-toggle').trigger('click');expect(wrapper.get('.app-shell').classes()).toContain('nav-collapsed');expect(localStorage.getItem('erut-nav-collapsed')).toBe('true');wrapper.unmount();
 const again=mount(App,{global:{stubs:{CampusMap:true,DesignSystem:true}}});await flushPromises();expect(again.get('.app-shell').classes()).toContain('nav-collapsed');await again.get('.sidebar-toggle').trigger('click');expect(again.get('.app-shell').classes()).not.toContain('nav-collapsed');again.unmount();
});
it('opens an institute admission context even when the module is already mounted',async()=>{
 const page=mount(Admissions);await page.setProps({initialInstitute:'law'});expect(page.get('select[aria-label="Подразделение"]').element.value).toBe('law');expect(page.findAll('.admission-bars button')).toHaveLength(1);await page.setProps({initialInstitute:'ief'});expect(page.get('select[aria-label="Подразделение"]').element.value).toBe('ief');expect(page.get('.admission-bars').text()).toContain('828');page.unmount();
});
it('fits each document page by default and resets zoom on page navigation',async()=>{
 const wrapper=mount(App,{global:{stubs:{CampusMap:true,DesignSystem:true}}});await flushPromises();await wrapper.get('.source-nav').trigger('click');await flushPromises();
 expect(document.querySelector('.presentation-stage.is-enlarged')).toBeNull();expect(document.querySelector<HTMLButtonElement>('[aria-label="Предыдущий слайд"]')!.disabled).toBe(true);
 const zoom=[...document.querySelectorAll<HTMLButtonElement>('.presentation-controls button')].find(b=>b.textContent?.includes('Увеличить'))!;zoom.click();await flushPromises();expect(document.querySelector('.presentation-stage.is-enlarged')).not.toBeNull();
 document.querySelector<HTMLButtonElement>('[aria-label="Следующий слайд"]')!.click();await flushPromises();expect(document.querySelector<HTMLImageElement>('.source-image')!.src).toContain('page-02.webp');expect(document.querySelector('.presentation-stage.is-enlarged')).toBeNull();
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await flushPromises();expect(document.querySelector('[role="dialog"]')).toBeNull();wrapper.unmount();
});
