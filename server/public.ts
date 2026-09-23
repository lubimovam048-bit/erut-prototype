import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createAppServer,type Credentials} from './app.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const credentials:Credentials=JSON.parse(await readFile(root+'.local/credentials.json','utf8'));
// HTTPS terminates at Cloudflare; this origin is reachable only on loopback.
const server=await createAppServer(root+'dist',credentials,{https:true});
server.listen(4174,'127.0.0.1',()=>console.log('RUT.digital HTTPS origin listening on 127.0.0.1:4174'));
for(const signal of ['SIGTERM','SIGINT'] as const)process.on(signal,()=>server.close(()=>process.exit(0)));
