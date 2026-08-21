import {asc,desc,eq} from "drizzle-orm";
import {getDb} from "../../../db";
import {auditEvents,botSteps,conversations,messages} from "../../../db/schema";
import {getAdminUser} from "../../lib/admin-auth";
export const dynamic="force-dynamic";
function id(){return crypto.randomUUID()}
function protocol(){const d=new Date();return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}${String(d.getUTCDate()).padStart(2,"0")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`}
export async function GET(){if(!await getAdminUser())return Response.json({error:"Não autorizado"},{status:401});const rows=await getDb().select().from(conversations).orderBy(desc(conversations.lastMessageAt)).limit(100);return Response.json({conversations:rows})}
export async function POST(request:Request){
 const body=await request.json().catch(()=>({})) as {visitorToken?:string;origin?:string;flow?:boolean};
 const conversationId=id(),visitorToken=body.visitorToken||id(),number=Math.floor(1000+Math.random()*9000),code=protocol(),db=getDb();
 await db.insert(conversations).values({id:conversationId,protocol:code,visitorToken,visitorLabel:`Visitante #${number}`,origin:body.origin==="WIDGET"?"WIDGET":"PUBLIC_PAGE"});
 await db.insert(auditEvents).values({conversationId,actor:"VISITOR",action:"CONVERSATION_CREATED",details:body.origin||"PUBLIC_PAGE"});
 if(!body.flow){const steps=await db.select().from(botSteps).where(eq(botSteps.published,true)).orderBy(asc(botSteps.position));const automatic=steps.filter(step=>step.kind!=="team").slice(0,2);if(automatic.length)await db.insert(messages).values(automatic.map(step=>({conversationId,sender:"BOT" as const,content:step.kind==="options"?`Escolha uma opção:\n${step.text}`:step.text})))}
 return Response.json({conversation:{id:conversationId,protocol:code,visitorToken,label:`Visitante #${number}`}},{status:201});
}
