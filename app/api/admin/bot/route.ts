import {asc} from "drizzle-orm";
import {getDb} from "../../../../db";
import {botSteps} from "../../../../db/schema";
import {getAdminUser} from "../../../lib/admin-auth";
export const dynamic="force-dynamic";
async function guard(){return getAdminUser()}
export async function GET(){if(!await guard())return Response.json({error:"Não autorizado"},{status:401});const rows=await getDb().select().from(botSteps).orderBy(asc(botSteps.position));return Response.json({steps:rows})}
export async function PUT(request:Request){
 const user=await guard();if(!user)return Response.json({error:"Não autorizado"},{status:401});
 const payload=await request.json() as {steps?:Array<{title:string;text:string;kind:"message"|"options"|"team"}>;publish?:boolean};
 if(!Array.isArray(payload.steps)||!payload.steps.length)return Response.json({error:"Adicione ao menos um passo."},{status:400});
 const db=getDb();await db.delete(botSteps);
 await db.insert(botSteps).values(payload.steps.map((s,i)=>({position:i+1,title:s.title.trim()||`Passo ${i+1}`,text:s.text.trim(),kind:s.kind,published:Boolean(payload.publish)})));
 return Response.json({ok:true,published:Boolean(payload.publish),savedBy:user.email});
}
