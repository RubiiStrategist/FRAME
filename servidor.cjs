'use strict';
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const ROOT = fs.realpathSync(__dirname);
const ROOT_ID = crypto.createHash('sha256').update(ROOT.toLowerCase()).digest('hex').slice(0,24);
const OPEN = process.argv.includes('--open');
const TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
function openBrowser(url) {
  if (!OPEN) return;
  if (process.platform !== 'win32') { console.log('Abra este endereco no navegador: ' + url); return; }
  execFile('rundll32.exe',['url.dll,FileProtocolHandler',url],error=>{
    if(error) console.log('Nao foi possivel abrir automaticamente. Copie este endereco: '+url);
  });
}
function existing(port) {
  return new Promise(resolve=>{
    const req=http.get({hostname:'127.0.0.1',port,path:'/__frame/status',timeout:700},res=>{
      let text='';res.on('data',chunk=>{if(text.length<2000)text+=chunk;});
      res.on('end',()=>{try {const data=JSON.parse(text);resolve(data.app==='FRAME Site Preview'&&data.root===ROOT_ID);}catch{resolve(false);}});
    });
    req.on('timeout',()=>{req.destroy();resolve(false);});req.on('error',()=>resolve(false));
  });
}
function reply(res,code,text){res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(text);}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');reply(res,405,'Metodo nao permitido.');return;}
  try {
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname==='/__frame/status'){
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
      res.end(req.method==='HEAD'?undefined:JSON.stringify({app:'FRAME Site Preview',root:ROOT_ID}));return;
    }
    let name=decodeURIComponent(url.pathname);
    if(name.includes('\0')||name.includes('\\')||name.split('/').some(p=>p.startsWith('.'))){reply(res,403,'Acesso negado.');return;}
    if(name.endsWith('/'))name+='index.html';
    const target=path.resolve(ROOT,'.'+name);
    if(!target.startsWith(ROOT+path.sep)){reply(res,403,'Acesso negado.');return;}
    const ext=path.extname(target).toLowerCase();
    if(!TYPES[ext]){reply(res,403,'Arquivo nao disponivel no site.');return;}
    const real=await fsp.realpath(target);
    if(!real.startsWith(ROOT+path.sep)){reply(res,403,'Acesso negado.');return;}
    const stat=await fsp.stat(real);
    if(!stat.isFile()){reply(res,404,'Pagina nao encontrada.');return;}
    res.setHeader('Content-Type',TYPES[ext]);res.setHeader('Cache-Control','no-cache');res.setHeader('Accept-Ranges','bytes');
    let start=0,end=stat.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.setHeader('Content-Range',`bytes */${stat.size}`);reply(res,416,'Intervalo invalido.');return;}
      if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;}
      else {start=Math.max(0,stat.size-Number(match[2]));}
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.setHeader('Content-Range',`bytes */${stat.size}`);reply(res,416,'Intervalo invalido.');return;}
      status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);
    }
    res.setHeader('Content-Length',Math.max(0,end-start+1));res.writeHead(status);
    if(req.method==='HEAD'||stat.size===0){res.end();return;}
    const stream=fs.createReadStream(real,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  } catch(error) {if(!res.headersSent)reply(res,error instanceof URIError?400:error.code==='ENOENT'?404:500,'Nao foi possivel abrir este arquivo.');else res.destroy();}
});
async function main(){
  for(let port=8787;port<8820;port++){
    const url=`http://127.0.0.1:${port}/`;
    if(await existing(port)){console.log('\nO site ja esta aberto nesta pasta.\n'+url+'\n');openBrowser(url);return;}
    const error=await new Promise(resolve=>{
      const fail=e=>{server.off('listening',ready);resolve(e);};
      const ready=()=>{server.off('error',fail);resolve(null);};
      server.once('error',fail);server.once('listening',ready);server.listen(port,'127.0.0.1');
    });
    if(error){if(error.code==='EADDRINUSE')continue;throw error;}
    console.log('\n==================================================\n  FRAME - SITE PRONTO\n\n  '+url+'\n\n  Deixe esta janela aberta enquanto usa o site.\n  Para encerrar, pressione Ctrl+C ou feche a janela.\n==================================================\n');
    console.log('FRAME_READY '+url);openBrowser(url);return;
  }
  throw new Error('Nao foi encontrada uma porta livre. Feche um servidor anterior e tente novamente.');
}
main().catch(e=>{console.error('\nNao foi possivel iniciar o site: '+e.message);process.exitCode=1;});
