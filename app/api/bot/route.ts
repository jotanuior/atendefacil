import {asc,eq} from "drizzle-orm";
import {getDb} from "../../../db";
import {botSteps} from "../../../db/schema";
export const dynamic="force-dynamic";
export async function GET(){
 try{const rows=await getDb().select().from(botSteps).where(eq(botSteps.published,true)).orderBy(asc(botSteps.position));
  return Response.json({steps:rows.length?rows:[
   {id:1,position:1,title:"Boas-vindas",text:"Olá! 👋 Como podemos ajudar você hoje?",kind:"message"},
   {id:2,position:2,title:"Escolha do assunto",text:"Atendimento geral\nFinanceiro\nSuporte técnico\nOutros assuntos",kind:"options"}
  ]});
 }catch(error){return Response.json({error:"Não foi possível carregar o atendimento."},{status:500})}
}
