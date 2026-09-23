import {afterEach,describe,expect,it,vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
import {UiButton,UiInput,UiSelect,UiTabs,UiSwitch,UiDialog,UiMetric} from '../../src/components/ui';
import PageControls from '../../src/components/PageControls.vue';
import DonutChart from '../../src/components/DonutChart.vue';
import LineChart from '../../src/components/LineChart.vue';
import {applyDesignTokens,tokens} from '../../src/design/tokens';
afterEach(()=>{document.body.innerHTML='';document.body.style.overflow='';});
describe('Action contracts',()=>{
 it('never submits by accident and blocks repeated loading/disabled actions',async()=>{
  const fn=vi.fn();const button=mount(UiButton,{props:{onClick:fn},slots:{default:'Открыть'}});
  expect(button.attributes('type')).toBe('button');await button.trigger('click');expect(fn).toHaveBeenCalledTimes(1);
  await button.setProps({loading:true});await button.trigger('click');expect(fn).toHaveBeenCalledTimes(1);expect(button.attributes('aria-busy')).toBe('true');
  await button.setProps({loading:false,disabled:true});await button.trigger('click');expect(fn).toHaveBeenCalledTimes(1);
 });
 it('supports explicit submit and metrics only become buttons when interactive',()=>{
  expect(mount(UiButton,{props:{type:'submit'}}).attributes('type')).toBe('submit');
  expect(mount(UiMetric,{props:{label:'Студенты',value:12}}).element.tagName).toBe('DIV');
  expect(mount(UiMetric,{props:{label:'Студенты',value:12,interactive:true}}).element.tagName).toBe('BUTTON');
 });
});
describe('Forms',()=>{
 it('binds labels and errors to the field, emits input and preserves native attributes',async()=>{
  const field=mount(UiInput,{props:{label:'Почта',modelValue:'',error:'Проверьте адрес'},attrs:{autocomplete:'email'}});
  const input=field.get('input');expect(field.get('label').attributes('for')).toBe(input.attributes('id'));
  expect(input.attributes('aria-invalid')).toBe('true');expect(field.get('#'+input.attributes('aria-describedby')).text()).toBe('Проверьте адрес');
  await input.setValue('demo@erut.local');expect(field.emitted('update:modelValue')?.[0]).toEqual(['demo@erut.local']);
  expect(input.attributes('autocomplete')).toBe('email');
  await field.setProps({error:undefined,hint:'Подсказка'});expect(input.attributes('aria-invalid')).toBeUndefined();expect(field.find('[role="alert"]').exists()).toBe(false);
 });
 it('keeps numeric selects numeric and string selects string',async()=>{
  const numeric=mount(UiSelect,{props:{modelValue:1,label:'Слайд'},slots:{default:'<option value="1">1</option><option value="2">2</option>'}});
  await numeric.get('select').setValue('2');expect(numeric.emitted('update:modelValue')?.[0]).toEqual([2]);
  const string=mount(UiSelect,{props:{modelValue:'1',label:'Строка'},slots:{default:'<option value="1">1</option><option value="2">2</option>'}});
  await string.get('select').setValue('2');expect(string.emitted('update:modelValue')?.[0]).toEqual(['2']);
 });
 it('switch label changes the native checked state and announces its role',async()=>{
  const control=mount(UiSwitch,{props:{modelValue:false,label:'Карта'}});await control.get('input').setValue(true);
  expect(control.emitted('update:modelValue')?.[0]).toEqual([true]);expect(control.get('input').attributes('role')).toBe('switch');
 });
});
describe('Navigation',()=>{
 it('tabs skip disabled values, wrap, support Home/End and move focus',async()=>{
  const wrapper=mount(UiTabs,{attachTo:document.body,props:{modelValue:'a',label:'Срезы',items:[{value:'a',label:'Обзор'},{value:'b',label:'Нет',disabled:true},{value:'c',label:'Приём'}],'onUpdate:modelValue':(value:string|number)=>wrapper.setProps({modelValue:value})}});
  wrapper.get('button').element.focus();await wrapper.get('nav').trigger('keydown',{key:'ArrowRight'});await nextTick();
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c']);expect(document.activeElement?.textContent).toBe('Приём');
  await wrapper.get('nav').trigger('keydown',{key:'ArrowRight'});expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a']);
  await wrapper.get('nav').trigger('keydown',{key:'End'});expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c']);
  await wrapper.get('nav').trigger('keydown',{key:'Home'});expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a']);
  expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(1);wrapper.unmount();
 });
 it('pagination protects boundaries and reports the current result range',async()=>{
  const p=mount(PageControls,{props:{page:0,total:10,size:4}});expect(p.get('[aria-label="Предыдущая страница"]').attributes('disabled')).toBeDefined();
  await p.get('[aria-label="Следующая страница"]').trigger('click');expect(p.emitted('update:page')?.[0]).toEqual([1]);
  await p.setProps({page:2});expect(p.text()).toContain('9–10 из 10');expect(p.get('[aria-label="Следующая страница"]').attributes('disabled')).toBeDefined();
  await p.setProps({total:2,page:0});expect(p.find('nav').exists()).toBe(false);
 });
});
describe('Large dialog',()=>{
 it('opens a new dossier at the beginning of its nested content',async()=>{
  const d=mount(UiDialog,{attachTo:document.body,props:{open:true,label:'First'},slots:{default:'<div class="modal-body"><section class="knowledge-section">Details</section></div>'}});
  await nextTick();const body=document.querySelector<HTMLElement>('.modal-body')!;const section=document.querySelector<HTMLElement>('.knowledge-section')!;
  body.scrollTop=250;section.scrollTop=400;await d.setProps({label:'Second'});await nextTick();
  expect(body.scrollTop).toBe(0);expect(section.scrollTop).toBe(0);expect(document.activeElement?.classList.contains('modal-close')).toBe(true);d.unmount();
 });
 it('locks background, loops focus, closes with Escape and restores the opener',async()=>{
  const app=document.createElement('div');app.id='app';const opener=document.createElement('button');opener.textContent='Открыть';app.append(opener);document.body.append(app);opener.focus();
  vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{width:10,height:10}] as unknown as DOMRectList);
  const dialog=mount(UiDialog,{attachTo:app,props:{open:false,label:'Карточка'},slots:{default:'<button id="last-action">Последнее действие</button>'}});
  await dialog.setProps({open:true});await nextTick();expect(app.inert).toBe(true);expect(document.body.style.overflow).toBe('hidden');
  const close=document.querySelector<HTMLButtonElement>('.modal-close')!;expect(document.activeElement).toBe(close);
  close.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));expect(document.activeElement?.id).toBe('last-action');
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));expect(document.activeElement).toBe(close);
  close.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));expect(dialog.emitted('close')).toHaveLength(1);
  await dialog.setProps({open:false});expect(app.inert).toBe(false);expect(document.body.style.overflow).toBe('');expect(document.activeElement).toBe(opener);dialog.unmount();
 });
 it('restores an existing scroll style when unmounted while open',async()=>{
  document.body.style.overflow='auto';const d=mount(UiDialog,{attachTo:document.body,props:{open:true,label:'Диалог'}});await nextTick();d.unmount();expect(document.body.style.overflow).toBe('auto');
 });
});
describe('Data views',()=>{
 it('handles zero totals and changing donut categories without NaN or stale selection',async()=>{
  const d=mount(DonutChart,{props:{items:[{name:'Ноль',value:0}]}});expect(d.html()).not.toContain('NaN');await d.get('.donut-legend button').trigger('click');
  await d.setProps({items:[]});expect(d.text()).toContain('0');expect(d.html()).not.toContain('NaN');
 });
 it('shows an explicit empty chart and supports negative values',()=>{
  expect(mount(LineChart,{props:{values:[],labels:[]}}).text()).toContain('Нет данных для графика');
  const line=mount(LineChart,{props:{values:[-2,0,3],labels:['2024','2025','2026']}});expect(line.html()).not.toContain('NaN');expect(line.get('svg').attributes('aria-label')).toContain('-2');
 });
 it('applies the JSON tokens as CSS custom properties',()=>{
  applyDesignTokens();expect(document.documentElement.style.getPropertyValue('--er-color-primary')).toBe(tokens.color.primary);expect(document.documentElement.style.getPropertyValue('--er-radius-lg')).toBe('18px');
 });
});

describe('Stable chart layout',()=>{
 it('keeps the total and ring geometry unchanged while inspecting a segment',async()=>{
  const chart=mount(DonutChart,{props:{label:'студентов · очно',items:[{name:'Набор 2026',value:122},{name:'Остальной контингент',value:177}]}});
  const total=chart.get('.donut-center').text();const geometry=chart.findAll('.donut-segment').map(s=>s.attributes('stroke-width'));
  await chart.get('.donut-legend button').trigger('mouseenter');await chart.get('.donut-legend button').trigger('click');
  expect(chart.get('.donut-center').text()).toBe(total);expect(total).toContain('299');expect(chart.get('.donut-center').find('small').exists()).toBe(false);
  expect(chart.get('.donut-legend button').text()).toContain('40,8%');expect(chart.findAll('.donut-segment').map(s=>s.attributes('stroke-width'))).toEqual(geometry);
  await chart.get('.donut-legend button').trigger('mouseleave');expect(chart.get('.donut-legend button').attributes('aria-pressed')).toBe('true');chart.unmount();
 });
 it('resets the focused point when a different line series has fewer points',async()=>{
  const chart=mount(LineChart,{props:{values:[1,2,3,4],labels:[2023,2024,2025,2026]}});
  await chart.findAll('g[tabindex]')[2].trigger('focus');await chart.setProps({values:[8,9],labels:[2025,2026]});
  expect(chart.html()).not.toContain('NaN');expect(chart.findAll('text').map(t=>t.text())).toContain('9');chart.unmount();
 });
});
