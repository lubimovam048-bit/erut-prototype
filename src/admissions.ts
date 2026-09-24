import {admissions as a,institutes} from './data';
import rules from '../data/admissions-dashboard.json';
export {rules};
export type Level='ВО'|'СПО';
export type Metric='applications'|'competition'|'score';
export type Section='overview'|'departments'|'programs'|'composition'|'quality';
export type Program={id:string;canonicalId:string|null;name:string;institute:string;value?:number;metric?:string;level?:string;source:number};
export type Department={id:string;short:string;name:string;enrolled:number;students:number};
export const metricLabels:Record<Metric,string>={applications:'По количеству заявлений',competition:'По конкурсу на бюджетное место',score:'Технические программы по среднему баллу ЕГЭ'};
export const metricUnits:Record<Metric,string>={applications:'заявлений',competition:'чел./место',score:'балла'};
export const departments=(level:Level):Department[]=>level==='ВО'?institutes:a.college.institutes.map(i=>({...i,id:i.short}));
export function programRows(level:Level,metric:Metric,mode='leaders',department='all'):Program[]{
 const rows=mode==='new'?(level==='ВО'?a.newPrograms:[]):level==='СПО'?(metric==='applications'?a.college.programs:[]):a.programs.filter(p=>p.metric===metric);
 const name=departments(level).find(d=>d.id===department)?.short;
 return rows.filter(p=>department==='all'||p.institute===name).slice().sort((x,y)=>'value'in x&&'value'in y?Number(y.value)-Number(x.value):0);
}
export function availablePrograms(level:Level,department:string){return [...programRows(level,'applications','leaders',department),...programRows(level,'competition','leaders',department),...programRows(level,'score','leaders',department),...programRows(level,'applications','new',department)];}
export const allPrograms:Program[]=[...a.programs,...a.college.programs,...a.newPrograms];
// Records from separate rankings are not merged by name. Source IDs identify a row, not a canonical program.
export function programMetrics(program:Program){return {applications:program.metric==='applications'?program.value??null:null,competition:program.metric==='competition'?program.value??null:null,score:program.metric==='score'?program.value??null:null};}
export const percentChange=(current:number|null,previous:number|null)=>current===null||previous===null||previous===0?null:(current-previous)/previous*100;
export const planCompletion=(enrolled:number|null,plan:number|null)=>enrolled===null||plan===null||plan===0?null:enrolled/plan*100;
export function csvEncode(rows:(string|number|null)[][]){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=value===null?'Нет данных':String(value);if(/^[=+@]/.test(s)||(/^\-/.test(s)&&!/^\-\d+(\.\d+)?$/.test(s)))s="'"+s;return /[;"\n\r]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;}).join(';')).join('\r\n');}
