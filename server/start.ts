import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createAppServer,type Credentials} from './app.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const credentials:Credentials=JSON.parse(await readFile(root+'.local/credentials.json','utf8'));
const server=await createAppServer(root+'dist',credentials);
server.listen(4173,'0.0.0.0',()=>console.log('eRut listening on 0.0.0.0:4173'));
for(const signal of ['SIGTERM','SIGINT'] as const)process.on(signal,()=>server.close(()=>process.exit(0)));
