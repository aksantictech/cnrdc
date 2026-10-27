import tls from 'node:tls';
import net from 'node:net';
export async function testSmtp(c){
 let socket=c.port===465?tls.connect({host:c.host,port:c.port,servername:c.host}):net.connect({host:c.host,port:c.port});let buffer='',queue=[],waiter,error;
 const attach=()=>{socket.setTimeout(10000,()=>socket.destroy(Error('SMTP timeout')));socket.on('data',d=>{buffer+=d.toString();let i;while((i=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+2);if(/^\d{3} /.test(line)){if(waiter){const w=waiter;waiter=null;w.resolve(line)}else queue.push(line)}}});socket.on('error',e=>{error=e;if(waiter){waiter.reject(e);waiter=null}});socket.on('close',()=>{error||=Error('SMTP closed');if(waiter){waiter.reject(error);waiter=null}})};attach();
 const response=()=>error?Promise.reject(error):queue.length?Promise.resolve(queue.shift()):new Promise((resolve,reject)=>{waiter={resolve,reject}});
 const command=async(cmd,codes)=>{if(cmd)socket.write(cmd+'\r\n');const r=await response();if(!codes.includes(Number(r.slice(0,3))))throw Error('SMTP '+r.slice(0,3))};
 try{await command(null,[220]);await command('EHLO carto-cns.local',[250]);if(c.port===587){await command('STARTTLS',[220]);socket.removeAllListeners();socket=tls.connect({socket,servername:c.host});buffer='';queue=[];attach();await new Promise((ok,no)=>{socket.once('secureConnect',ok);socket.once('error',no)});await command('EHLO carto-cns.local',[250])}if(c.username){await command('AUTH LOGIN',[334]);await command(Buffer.from(c.username).toString('base64'),[334]);await command(Buffer.from(c.password).toString('base64'),[235])}await command('QUIT',[221]);return{success:true,message:'Connexion chiffrée et authentification SMTP vérifiées. Aucun e-mail envoyé.'}}finally{socket.destroy()}
}
