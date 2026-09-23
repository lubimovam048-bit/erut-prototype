import data from '../data/knowledge.json';
export interface KnowledgeRow {label:string;value:string;description:string;topic?:string;institute?:string;object?:string}
export interface KnowledgeLink {label:string;id:string;kind:'topic'|'route'|'institute'|'object'}
export interface Dossier {id:string;title:string;summary:string;sections:{title:string;rows:KnowledgeRow[]}[];metrics:{label:string;value:string}[];related:KnowledgeLink[];source:number}
export const knowledge=data as Dossier[];
export const findTopic=(id:string)=>knowledge.find(t=>t.id===id);
