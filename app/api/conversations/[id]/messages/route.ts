import {asc,eq} from "drizzle-orm";
import {getDb} from "../../../../../db";
import {auditEvents,conversations,messages} from "../../../../../db/schema";
import {getChatGPTUser} from "../../../../chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const token=new URL(request.url).searchParams.get("token");const admin=await getAdminUser();const db=getDb();
 if(!admin){const [conversation]=await db.select().from(conversations).where(eq(conversations.id,id)).limit(1);if(!conversation||conversation.visitorToken!==token)return Response.json({error:"Não autorizado"},{status:401})}
 const rows=await db.select().from(messages).where(eq(messages.conversationId,id)).orderBy(asc(messages.id));
 const events=await db.select().from(auditEvents).where(eq(auditEvents.conversationId,id)).orderBy(asc(auditEvents.id));
 const labels:Record<string,string>={FLOW_NODE:"Etapa exibida",RATING:"Avaliação recebida",FLOW_END:"Atendimento concluído",DOWNLOAD:"Arquivo baixado"};
 const timeline=[...rows,...events.map(e=>{let details:any={};try{details=JSON.parse(e.details||"{}")}catch{}const content=e.action==="FLOW_NODE"?`${details.title||details.nodeId||"Etapa"} (${details.kind||"conteúdo"})`:e.action==="RATING"?`${details.value||"-"} de 5`:e.action==="DOWNLOAD"?details.url||"Arquivo":labels[e.action]||e.action;return{id:`event-${e.id}`,sender:"SYSTEM",content,createdAt:e.createdAt,event:e.action,label:labels[e.action]||e.action}})].sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
 return Response.json({messages:timeline});
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const body=await request.json() as {token?:string;content?:string;sender?:string};const content=body.content?.trim();if(!content)return Response.json({error:"Mensagem vazia"},{status:400});
 const db=getDb();const admin=await getAdminUser();if(admin)return Response.json({error:"Este sistema funciona somente com o bot. O histórico não permite respostas manuais."},{status:405});const [conversation]=await db.select().from(conversations).where(eq(conversations.id,id)).limit(1);
 if(!conversation)return Response.json({error:"Atendimento não encontrado"},{status:404});
 if(!admin&&conversation.visitorToken!==body.token)return Response.json({error:"Não autorizado"},{status:401});
 const sender="VISITOR";const [message]=await db.insert(messages).values({conversationId:id,sender,content}).returning();
 await db.update(conversations).set({lastMessageAt:new Date().toISOString(),status:"BOT"}).where(eq(conversations.id,id));
 return Response.json({message},{status:201});
}
