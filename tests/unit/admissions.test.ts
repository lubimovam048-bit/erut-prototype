import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {mount,enableAutoUnmount,flushPromises} from '@vue/test-utils';
import Admissions from '../../src/components/Admissions.vue';
import LineChart from '../../src/components/LineChart.vue';
import {programRows,programMetrics,percentChange,planCompletion,csvEncode,allPrograms} from '../../src/admissions';
import {admissions as a} from '../../src/data';
enableAutoUnmount(afterEach);
beforeEach(()=>{sessionStorage.clear();vi.stubGlobal('scrollTo',vi.fn());});
afterEach(()=>vi.unstubAllGlobals());
const click=async(page:ReturnType<typeof mount>,label:string)=>{const b=page.findAll('button').find(b=>b.text().includes(label));expect(b,`Missing button ${label}`).toBeTruthy();await b!.trigger('click');await flushPromises();};
describe('admissions specification',()=>{
 it('shows both histories and all mandatory overview blocks simultaneously',()=>{
  const page=mount(Admissions);expect(page.findAllComponents(LineChart)).toHaveLength(2);expect(page.findAll('.ad-kpi')).toHaveLength(5);expect(page.findAll('.ad-top-list button')).toHaveLength(5);
  for(const text of ['Все формы обучения','очная форма','География набора','Приём по квотам','СВО и семьи','Средний балл ЕГЭ по вузам'])expect(page.text()).toContain(text);
  expect(page.text()).not.toContain('Общий контингент');expect(page.findAll('.university-score')).toHaveLength(9);expect(page.findAll('.ad-kpi')[4]!.text()).toContain('441');expect(page.findAll('.ad-kpi')[4]!.text()).toContain('38,1%');
 });
 it('keeps an old year honest when clicking its enrollment point',async()=>{
  const page=mount(Admissions);page.findAllComponents(LineChart)[0]!.vm.$emit('select',1);await flushPromises();
  expect(page.get('select[aria-label="Год кампании"]').element.value).toBe('2024');expect(page.text()).toContain('Нет детализации');expect(page.text()).toContain('6 713');expect(page.find('tbody').exists()).toBe(false);
  await click(page,'Назад');expect(page.find('.ad-notice').exists()).toBe(false);expect(page.findAllComponents(LineChart)).toHaveLength(2);expect(page.get('select[aria-label="Год кампании"]').element.value).toBe('2026');
 });
 it('opens a contextual quota and separates target places from enrolled',async()=>{
  const page=mount(Admissions);await click(page,'Приём по квотам');await click(page,'Целевой приём');expect(page.text()).toContain('Целевой приём по заказчикам');expect(page.text()).toContain('217');expect(page.text()).toContain('110');expect(page.text()).toContain('−180');expect(page.text()).not.toContain('481,7');expect(page.text()).not.toContain('1 147');
  await click(page,'Назад');await click(page,'Особая квота');expect(page.text()).toContain('Сироты');expect(page.text()).toContain('Распределение 56');
 });
 it('restores department filter and sort across department → program → back',async()=>{
  const page=mount(Admissions);await click(page,'Подразделения');await page.get('select[aria-label="Подразделение"]').setValue('izht');await page.get('select[aria-label="Сортировка подразделений"]').setValue('asc');
  await page.get('tbody button').trigger('click');await flushPromises();await page.get('.ad-program-name').trigger('click');await flushPromises();expect(page.text()).toContain('Назад к подразделению');
  await page.get('.ad-breadcrumb button').trigger('click');await flushPromises();expect(page.text()).toContain('Доступные программы подразделения');await page.get('.ad-breadcrumb button').trigger('click');await flushPromises();
  expect(page.get('select[aria-label="Подразделение"]').element.value).toBe('izht');expect(page.get('select[aria-label="Сортировка подразделений"]').element.value).toBe('asc');
 });
 it('does not copy a leaderboard score into the similarly named new program',async()=>{
  const page=mount(Admissions);await click(page,'Программы');await click(page,'Новые программы');expect(page.findAll('.ad-new')).toHaveLength(9);await click(page,'Строительство подземных');expect(page.text()).not.toContain('81,6');expect(page.findAll('.ad-program-metrics strong').map(b=>b.text())).toEqual(['Нет данных','Нет данных','Нет данных']);
 });
 it('shows all six SPO leaders and correct priority categories without VO metrics',async()=>{
  const page=mount(Admissions);await page.get('select[aria-label="Уровень образования"]').setValue('СПО');expect(page.findAllComponents(LineChart)).toHaveLength(0);expect(page.findAll('.ad-program-row')).toHaveLength(6);
  expect(page.text()).not.toContain('ЕГЭ');expect(page.text()).not.toContain('Особая квота');expect(page.text()).not.toContain('Чемпионат');expect(page.text()).toContain('7,2');
  await click(page,'Первоочередной приём');expect(page.text()).toContain('Дети участников боевых действий');expect(page.text()).toContain('89');
 });
 it('does not expose EGE in a college program card',async()=>{
  const page=mount(Admissions);await page.get('select[aria-label="Уровень образования"]').setValue('СПО');await click(page,'Юриспруденция');expect(page.text()).not.toContain('ЕГЭ');expect(page.text()).toContain('769');expect(page.findAll('.ad-program-metrics strong')).toHaveLength(2);
 });
 it('switching level resets incompatible context but preserves the selected year',async()=>{
  const page=mount(Admissions,{props:{initialInstitute:'ief'}});await page.get('select[aria-label="Год кампании"]').setValue('2025');await page.get('select[aria-label="Уровень образования"]').setValue('СПО');expect(page.get('select[aria-label="Год кампании"]').element.value).toBe('2025');expect(page.text()).toContain('сброшены');expect(page.text()).toContain('Нет детализации');expect(page.find('.ad-active-filters').exists()).toBe(false);
 });
 it('has a dedicated foreign empty state and contextual regional detail',async()=>{
  const page=mount(Admissions);await click(page,'Иностранный набор · нет данных');expect(page.text()).toContain('Нет данных об иностранных гражданах');expect(page.text()).toContain('Число стран');await click(page,'Назад');await click(page,'Калужская область');expect(page.text()).toContain('99');expect(page.text()).toContain('по подразделениям и программам не предоставлено');
 });
 it('exports current program ranking, filters, units and unknown values',async()=>{
  let blob:Blob|undefined;vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn((b:Blob)=>{blob=b;return 'blob:test';}),revokeObjectURL:vi.fn()}));vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
  const page=mount(Admissions);await click(page,'Программы');await page.get('select[aria-label="Подразделение"]').setValue('ief');await page.get('select[aria-label="Рейтинг программ"]').setValue('competition');await click(page,'CSV');
  const text=await new Promise<string>(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.readAsText(blob!);});expect(text).toContain('Год;2026');expect(text).toContain('Экономика;ИЭФ;255;чел./место');expect(text).not.toContain('3720');expect(text).toContain('Подразделение;ИЭФ');
 });
 it('maintains source-row identities, ranking counts and safe calculations',()=>{
  expect(new Set(allPrograms.map(p=>p.id)).size).toBe(allPrograms.length);expect(programRows('СПО','applications')).toHaveLength(6);for(const m of ['applications','competition','score'] as const)expect(programRows('ВО',m)).toHaveLength(5);
  expect(programMetrics(a.newPrograms[0]!)).toEqual({applications:null,competition:null,score:null});expect(percentChange(10,0)).toBeNull();expect(planCompletion(10,null)).toBeNull();expect(percentChange(7060,7164)).toBeCloseTo(-1.45,2);expect(csvEncode([['=1+1','a;b',null]])).toContain("'=1+1;\"a;b\";Нет данных");
 });
});
