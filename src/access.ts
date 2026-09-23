import {ref} from 'vue';
import access from '../data/access.json';
const key='rut-digital-session';
function restore(){
 try{const value=JSON.parse(sessionStorage.getItem(key)||'null');return value?.login===access.login&&typeof value.expiresAt==='number'&&value.expiresAt>Date.now()?value.expiresAt:0;}catch{return 0;}
}
export const signedIn=ref(false);
let timer:ReturnType<typeof setTimeout>|undefined;
export function signOut(){clearTimeout(timer);signedIn.value=false;try{sessionStorage.removeItem(key);}catch{/* Storage can be disabled by browser policy. */}}
function activate(expiresAt:number){
 clearTimeout(timer);signedIn.value=true;timer=setTimeout(signOut,Math.max(0,expiresAt-Date.now()));
}
export function signIn(login:string,password:string){
 if(login.trim()!==access.login||password!==access.password)return false;
 const expiresAt=Date.now()+access.sessionHours*60*60*1000;
 sessionStorage.setItem(key,JSON.stringify({login:access.login,expiresAt}));activate(expiresAt);return true;
}
export function checkSession(){const expiresAt=restore();if(expiresAt)activate(expiresAt);else signOut();}
checkSession();
