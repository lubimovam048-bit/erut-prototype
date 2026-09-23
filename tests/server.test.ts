import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createAppServer} from '../server/app.ts';
test('server protects data, rejects forged sessions and invalid logins, and revokes logout',async()=>{
 const server=await createAppServer('dist',{login:'test-user',salt:'test-salt',hash:scryptSync('test-password','test-salt',64).toString('hex')});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}`;
 try{
  const manifest=JSON.parse(await readFile('dist/.vite/manifest.json','utf8'));const appAsset='/'+manifest['index.html'].file;
  assert.match(await(await fetch(base)).text(),/login-/);assert.equal((await fetch(base+appAsset)).status,401);assert.equal((await fetch(base+'/source.pdf')).status,401);
  assert.equal((await fetch(base+'/api/session',{headers:{cookie:'erut-session=demo'}})).status,401);
  const login=(password:string,origin=base)=>fetch(base+'/api/login',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({login:'test-user',password})});
  assert.equal((await login('wrong')).status,401);assert.equal((await login('test-password','http://example.org')).status,403);
  const result=await login('test-password');assert.equal(result.status,200);const cookie=result.headers.get('set-cookie')!;assert.match(cookie,/HttpOnly/);const headers={cookie:cookie.split(';')[0]};
  assert.equal((await fetch(base+appAsset,{headers})).status,200);assert.equal((await fetch(base+'/api/session',{headers})).status,200);assert.match(await(await fetch(base,{headers})).text(),/app-/);
  assert.equal((await fetch(base+'/api/logout',{method:'POST',headers:{...headers,origin:base}})).status,200);assert.equal((await fetch(base+appAsset,{headers})).status,401);
  for(let n=0;n<10;n++)assert.equal((await login('wrong')).status,401);assert.equal((await login('test-password')).status,429);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('HTTPS origin requires HTTPS same-origin requests and issues secure cookies',async()=>{
 const server=await createAppServer('dist',{login:'test-user',salt:'test-salt',hash:scryptSync('test-password','test-salt',64).toString('hex')},{https:true});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}`;
 try{
  const login=(origin:string)=>fetch(base+'/api/login',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({login:'test-user',password:'test-password'})});
  assert.equal((await login(base)).status,403);
  assert.equal((await login('https://wrong.example')).status,403);
  const result=await login(base.replace('http:','https:'));assert.equal(result.status,200);assert.match(result.headers.get('set-cookie')!,/; Secure/);
  assert.equal((await fetch(base+'/api/session')).status,401);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
