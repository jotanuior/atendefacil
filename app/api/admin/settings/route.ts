import {getDb} from "../../../../db";
import {appSettings} from "../../../../db/schema";
import {getChatGPTUser} from "../../../chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET(){if(!await getAdminUser())return Response.json({error:"Não autorizado"},{status:401});const rows=await getDb().select().from(appSettings);return Response.json({settings:Object.fromEntries(rows.map(r=>[r.key,JSON.parse(r.value)]))})}
export async function PUT(request:Request){const user=await getAdminUser();if(!user)return Response.json({error:"Não autorizado"},{status:401});const body=await request.json() as Record<string,unknown>;const db=getDb();for(const [key,value] of Object.entries(body)){await db.insert(appSettings).values({key,value:JSON.stringify(value),updatedBy:user.email,updatedAt:new Date().toISOString()}).onConflictDoUpdate({target:appSettings.key,set:{value:JSON.stringify(value),updatedBy:user.email,updatedAt:new Date().toISOString()}})}return Response.json({ok:true})}
