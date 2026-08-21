import http from "node:http";
import nodemailer from "nodemailer";

const port=3025;
function bool(name,fallback=false){const value=process.env[name];return value==null?fallback:value==="true"}
const transporter=nodemailer.createTransport({
  host:process.env.SMTP_HOST,
  port:Number(process.env.SMTP_PORT||587),
  secure:bool("SMTP_SECURE"),
  requireTLS:bool("SMTP_STARTTLS",true),
  ignoreTLS:!bool("SMTP_STARTTLS",true)&&!bool("SMTP_SECURE"),
  auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},
  tls:{rejectUnauthorized:bool("SMTP_TLS_REJECT_UNAUTHORIZED",true)}
});

function escapeHtml(value=""){return value.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]))}
const server=http.createServer((request,response)=>{
  if(request.method==="GET"&&request.url==="/health")return response.end("ok");
  if(request.method!=="POST"||request.url!=="/send"){response.writeHead(404);return response.end()}
  let raw="";
  request.on("data",chunk=>{raw+=chunk;if(raw.length>32768)request.destroy()});
  request.on("end",async()=>{
    try{
      const {to,name,url}=JSON.parse(raw);
      if(!to||!url)throw new Error("Destinatário ou link ausente");
      await transporter.sendMail({
        from:process.env.SMTP_FROM||process.env.SMTP_USER,
        to,
        subject:"Redefinição de senha — Atende Fácil",
        html:`<h2>Redefinição de senha</h2><p>Olá, ${escapeHtml(name||"usuário")}.</p><p><a href="${escapeHtml(url)}">Clique aqui para criar uma nova senha</a>.</p><p>O link expira em 1 hora e só pode ser utilizado uma vez.</p>`
      });
      response.writeHead(200,{"content-type":"application/json"});response.end('{"ok":true}');
    }catch(error){
      console.error("Falha no relay SMTP",error);
      response.writeHead(502,{"content-type":"application/json"});response.end(JSON.stringify({error:error instanceof Error?error.message:"Falha SMTP"}));
    }
  });
});
server.listen(port,"127.0.0.1",()=>console.log(`Relay SMTP interno pronto em 127.0.0.1:${port}`));
