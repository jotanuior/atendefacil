import {desc,eq} from "drizzle-orm";
import {getDb} from "../../../db";
import {botFlows} from "../../../db/schema";
import {defaultFlow} from "../../lib/default-flow";
export const dynamic="force-dynamic";
export async function GET(){try{const [flow]=await getDb().select().from(botFlows).where(eq(botFlows.published,true)).orderBy(desc(botFlows.id)).limit(1);return Response.json({flow:flow?{name:flow.name,config:JSON.parse(flow.config)}:{name:"Fluxo inicial",config:defaultFlow,fallback:true}})}catch(error){console.error("Falha ao carregar fluxo publicado",error);return Response.json({flow:{name:"Fluxo inicial",config:defaultFlow,fallback:true}})}}
