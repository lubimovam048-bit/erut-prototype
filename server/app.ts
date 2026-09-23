import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';

export type Credentials={login:string;salt:string;hash:string};
type Asset={file:string;imports?:string[];css?:string[];assets?:string[]};
export async function createAppServer(root:string,credentials:Credentials,options:{https?:boolean}={}){
 const dist=await realpath(root);const manifest:Record<string,Asset>=JSON.parse(await readFile(resolve(dist,'.vite/manifest.json'),'utf8'));
 const publicFiles=new Set(['/favicon.svg']);const visited=new Set<string>();
 function allow(key:string){if(visited.has(key))return;visited.add(key);const entry=manifest[key];if(!entry)throw Error('Missing login asset');for(const file of [entry.file,...entry.css??[],...entry.assets??[]])publicFiles.add('/'+file);for(const dep of entry.imports??[])allow(dep);}
 allow('login.html');
 const sessions=new Map<string,number>();const attempts=new Map<string,{count:number;until:number}>();const lifetime=8*60*60*1000;
 const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.pdf':'application/pdf'};
 function json(res:ServerResponse,status:number,data:unknown){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));}
 function token(req:IncomingMessage){return req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('erut-session='))?.slice(13)??'';}
 function authenticated(req:IncomingMessage){const id=token(req);const expires=sessions.get(id);if(!expires)return false;if(expires<Date.now()){sessions.delete(id);return false;}return true;}
 async function body(req:IncomingMessage){let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)throw Error('Body too large');}return JSON.parse(text);}
 async function file(req:IncomingMessage,res:ServerResponse,path:string){
  try{const target=await realpath(resolve(dist,'.'+path));if(!target.startsWith(dist+sep)||!(await stat(target)).isFile()){json(res,404,{error:'Not found'});return;}
   const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]??'application/octet-stream','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{json(res,404,{error:'Not found'});}
 }
 const server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
  try{
   const path=decodeURIComponent(new URL(req.url??'/','http://localhost').pathname);const signedIn=authenticated(req);
   if(req.method==='POST'){
    if(req.headers.origin!==`${options.https?'https':'http'}://${req.headers.host}`){json(res,403,{error:'Origin rejected'});return;}
    if(path==='/api/login'){
     const address=req.socket.remoteAddress??'unknown';const now=Date.now();const previous=attempts.get(address);const attempt=previous&&previous.until>now?previous:{count:0,until:now+900000};
     if(attempt.count>=10){json(res,429,{error:'Try later'});return;}
     const input=await body(req);const hash=scryptSync(typeof input.password==='string'?input.password:'',credentials.salt,64);const valid=timingSafeEqual(hash,Buffer.from(credentials.hash,'hex'))&&input.login===credentials.login;
     if(!valid){attempt.count++;attempts.set(address,attempt);json(res,401,{error:'Invalid credentials'});return;}
     attempts.delete(address);sessions.delete(token(req));const id=randomBytes(32).toString('hex');sessions.set(id,now+lifetime);
     res.setHeader('Set-Cookie',`erut-session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${lifetime/1000}${options.https?'; Secure':''}`);json(res,200,{ok:true});return;
    }
    if(path==='/api/logout'){sessions.delete(token(req));res.setHeader('Set-Cookie',`erut-session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${options.https?'; Secure':''}`);json(res,200,{ok:true});return;}
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){json(res,405,{error:'Method not allowed'});return;}
   if(path==='/api/session'){json(res,signedIn?200:401,{authenticated:signedIn});return;}
   if(path==='/'||path==='/index.html'||path==='/login.html'){await file(req,res,signedIn?'/index.html':'/login.html');return;}
   if(path.startsWith('/.')){json(res,404,{error:'Not found'});return;}
   if(!signedIn&&!publicFiles.has(path)){json(res,401,{error:'Authentication required'});return;}
   await file(req,res,path);
  }catch{if(!res.headersSent)json(res,400,{error:'Invalid request'});else res.end();}
 });
 const cleanup=setInterval(()=>{for(const [id,until]of sessions)if(until<Date.now())sessions.delete(id);for(const [ip,a]of attempts)if(a.until<Date.now())attempts.delete(ip);},60000);cleanup.unref();server.on('close',()=>clearInterval(cleanup));return server;
}
