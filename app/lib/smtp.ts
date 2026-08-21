import {connect} from "cloudflare:sockets";

type Runtime=Record<string,string|undefined>;

function address(value:string){return value.match(/<([^>]+)>/)?.[1]||value.trim()}
function escapeHeader(value:string){return value.replace(/[\r\n]+/g," ").trim()}
function encodeHeader(value:string){return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(value)))}?=`}

export async function sendPasswordResetEmail(runtime:Runtime,to:string,name:string,url:string){
  const host=runtime.SMTP_HOST?.trim(),user=runtime.SMTP_USER?.trim(),password=runtime.SMTP_PASSWORD;
  const from=runtime.SMTP_FROM?.trim();
  if(!host||!user||!password||!from)throw new Error("SMTP não configurado");
  const port=Number(runtime.SMTP_PORT||587),secure=runtime.SMTP_SECURE==="true",starttls=runtime.SMTP_STARTTLS!=="false"&&!secure;
  let socket=connect({hostname:host,port},{secureTransport:secure?"on":starttls?"starttls":"off"});
  let reader=socket.readable.getReader(),writer=socket.writable.getWriter(),pending="";
  const decoder=new TextDecoder(),encoder=new TextEncoder();
  async function response(){
    for(;;){
      const lines=pending.split("\r\n");
      for(let i=0;i<lines.length-1;i++)if(/^\d{3} /.test(lines[i])){const out=lines.slice(0,i+1).join("\r\n");pending=lines.slice(i+1).join("\r\n");return out}
      const chunk=await reader.read();if(chunk.done)throw new Error("Conexão SMTP encerrada");pending+=decoder.decode(chunk.value,{stream:true});
    }
  }
  async function command(value:string,codes:number[]){await writer.write(encoder.encode(`${value}\r\n`));const reply=await response(),code=Number(reply.slice(0,3));if(!codes.includes(code))throw new Error(`SMTP recusou o comando (${code})`);return reply}
  const greeting=await response();if(Number(greeting.slice(0,3))!==220)throw new Error("Servidor SMTP indisponível");
  await command(`EHLO atendefacil`,[250]);
  if(starttls){
    await command("STARTTLS",[220]);reader.releaseLock();writer.releaseLock();socket=socket.startTls();reader=socket.readable.getReader();writer=socket.writable.getWriter();pending="";await command("EHLO atendefacil",[250]);
  }
  await command("AUTH LOGIN",[334]);await command(btoa(user),[334]);await command(btoa(password),[235]);
  await command(`MAIL FROM:<${address(from)}>`,[250]);await command(`RCPT TO:<${address(to)}>`,[250,251]);await command("DATA",[354]);
  const safeName=name.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]||c));
  const html=`<h2>Redefinição de senha</h2><p>Olá, ${safeName}.</p><p><a href="${url}">Clique aqui para criar uma nova senha</a>.</p><p>O link expira em 1 hora e só pode ser utilizado uma vez.</p>`;
  const message=[`From: ${escapeHeader(from)}`,`To: ${escapeHeader(to)}`,`Subject: ${encodeHeader("Redefinição de senha — Atende Fácil")}`,"MIME-Version: 1.0","Content-Type: text/html; charset=UTF-8","Content-Transfer-Encoding: 8bit","",html.replace(/^\./gm,".."),"."].join("\r\n");
  await writer.write(encoder.encode(`${message}\r\n`));const accepted=await response();if(Number(accepted.slice(0,3))!==250)throw new Error("Servidor SMTP não aceitou a mensagem");
  await command("QUIT",[221]);writer.releaseLock();reader.releaseLock();await socket.close();
}
