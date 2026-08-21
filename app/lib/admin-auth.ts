import {and,eq,gt} from "drizzle-orm";
import {cookies} from "next/headers";
import {getDb} from "../../db";
import {adminSessions,adminUsers} from "../../db/schema";
import {getChatGPTUser} from "../chatgpt-auth";

export const SESSION_COOKIE="atendefacil_session";
const enc=new TextEncoder();
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function hashToken(value:string){return hex(await crypto.subtle.digest("SHA-256",enc.encode(value)))}
export async function hashPassword(password:string,salt=crypto.randomUUID().replaceAll("-","")){const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:210000,hash:"SHA-256"},key,256);return `pbkdf2$210000$${salt}$${hex(bits)}`}
export async function verifyPassword(password:string,stored:string){const [type,,salt]=stored.split("$");if(type!=="pbkdf2"||!salt)return false;return await hashPassword(password,salt)===stored}
export async function getAdminUser(){const platform=await getChatGPTUser();if(platform)return{id:"platform",name:platform.displayName,email:platform.email,role:"ADMIN" as const,platform:true};const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;const tokenHash=await hashToken(token),db=getDb();const [row]=await db.select({id:adminUsers.id,name:adminUsers.name,email:adminUsers.email,role:adminUsers.role,active:adminUsers.active}).from(adminSessions).innerJoin(adminUsers,eq(adminSessions.userId,adminUsers.id)).where(and(eq(adminSessions.tokenHash,tokenHash),gt(adminSessions.expiresAt,new Date().toISOString()))).limit(1);return row?.active?{...row,platform:false}:null}
export async function requireAdmin(){const user=await getAdminUser();return user?.role==="ADMIN"?user:null}
