import {desc} from "drizzle-orm";
import {getDb} from "../../../../db";
import {botFlows} from "../../../../db/schema";
import {getChatGPTUser} from "../../../chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET(){if(!await getAdminUser())return Response.json({error:"Não autorizado"},{status:401});const [flow]=await getDb().select().from(botFlows).orderBy(desc(botFlows.id)).limit(1);return Response.json({flow:flow?{...flow,config:JSON.parse(flow.config)}:null})}
export async function PUT(request:Request){const user=await getAdminUser();if(!user)return Response.json({error:"Não autorizado"},{status:401});const body=await request.json() as {name?:string;config?:unknown;publish?:boolean};if(!body.config)return Response.json({error:"Fluxo vazio"},{status:400});const db=getDb();const [last]=await db.select().from(botFlows).orderBy(desc(botFlows.id)).limit(1);const [flow]=await db.insert(botFlows).values({name:body.name?.trim()||"Fluxo principal",config:JSON.stringify(body.config),published:Boolean(body.publish),version:(last?.version||0)+1,updatedBy:user.email}).returning();return Response.json({flow:{...flow,config:body.config}})}
