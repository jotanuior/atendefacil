import {and,eq,isNull} from "drizzle-orm";
import {env} from "cloudflare:workers";
import {getDb} from "../../../../db";
import {adminUsers,passwordResetTokens} from "../../../../db/schema";
import {hashPassword,hashToken} from "../../../lib/admin-auth";
import {sendPasswordResetEmail} from "../../../lib/smtp";

export async function POST(request:Request){
  const {email}=(await request.json().catch(()=>({}))) as {email?:string};
  const normalized=email?.trim().toLowerCase();
  if(!normalized)return Response.json({error:"Informe o e-mail"},{status:400});

  const runtime=env as unknown as Record<string,string|undefined>,db=getDb();
  let [user]=await db.select().from(adminUsers).where(and(eq(adminUsers.email,normalized),eq(adminUsers.active,true))).limit(1);

  // O primeiro administrador normalmente só é criado no primeiro login.
  // Permite recuperar a senha inicial diretamente pelo ADMIN_EMAIL do ambiente.
  if(!user&&runtime.ADMIN_EMAIL?.trim().toLowerCase()===normalized&&runtime.ADMIN_PASSWORD){
    try{
      [user]=await db.insert(adminUsers).values({
        id:crypto.randomUUID(),
        name:runtime.ADMIN_NAME||"Administrador",
        email:normalized,
        passwordHash:await hashPassword(runtime.ADMIN_PASSWORD),
        role:"ADMIN"
      }).returning();
    }catch{
      [user]=await db.select().from(adminUsers).where(eq(adminUsers.email,normalized)).limit(1);
    }
  }

  if(user?.active){
    const raw=crypto.randomUUID()+crypto.randomUUID(),tokenId=crypto.randomUUID();
    const base=(runtime.APP_PUBLIC_URL||`${new URL(request.url).origin}${runtime.APP_BASE_PATH||""}`).replace(/\/$/,"");
    const url=`${base}/redefinir-senha?token=${encodeURIComponent(raw)}`;
    await db.update(passwordResetTokens).set({usedAt:new Date().toISOString()}).where(and(eq(passwordResetTokens.userId,user.id),isNull(passwordResetTokens.usedAt)));
    await db.insert(passwordResetTokens).values({id:tokenId,userId:user.id,tokenHash:await hashToken(raw),expiresAt:new Date(Date.now()+3600000).toISOString()});
    try{
      await sendPasswordResetEmail(runtime,user.email,user.name,url);
    }catch(error){
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id,tokenId));
      console.error("Falha no envio SMTP",error);
      return Response.json({error:"Não foi possível enviar o e-mail. Verifique a configuração SMTP."},{status:503});
    }
  }
  return Response.json({ok:true,message:"Se o e-mail estiver cadastrado, enviaremos as instruções."});
}
