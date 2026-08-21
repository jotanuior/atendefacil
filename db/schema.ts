import {integer,sqliteTable,text} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

export const teams=sqliteTable("teams",{
 id:integer("id").primaryKey({autoIncrement:true}),
 name:text("name").notNull().unique(),
 active:integer("active",{mode:"boolean"}).notNull().default(true),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const botSteps=sqliteTable("bot_steps",{
 id:integer("id").primaryKey({autoIncrement:true}),
 position:integer("position").notNull(),
 title:text("title").notNull(),
 text:text("text").notNull(),
 kind:text("kind",{enum:["message","options","team"]}).notNull(),
 published:integer("published",{mode:"boolean"}).notNull().default(false),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const botFlows=sqliteTable("bot_flows",{
 id:integer("id").primaryKey({autoIncrement:true}),
 name:text("name").notNull().default("Fluxo principal"),
 config:text("config").notNull(),
 published:integer("published",{mode:"boolean"}).notNull().default(false),
 version:integer("version").notNull().default(1),
 updatedBy:text("updated_by"),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const appSettings=sqliteTable("app_settings",{
 key:text("key").primaryKey(),
 value:text("value").notNull(),
 updatedBy:text("updated_by"),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const conversations=sqliteTable("conversations",{
 id:text("id").primaryKey(),
 protocol:text("protocol").notNull().unique(),
 visitorToken:text("visitor_token").notNull(),
 visitorLabel:text("visitor_label").notNull(),
 status:text("status",{enum:["BOT","WAITING","OPEN","CLOSED"]}).notNull().default("BOT"),
 teamId:integer("team_id").references(()=>teams.id),
 assignedTo:text("assigned_to"),
 origin:text("origin").notNull().default("PUBLIC_PAGE"),
 lastMessageAt:text("last_message_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 closedAt:text("closed_at")
});

export const messages=sqliteTable("messages",{
 id:integer("id").primaryKey({autoIncrement:true}),
 conversationId:text("conversation_id").notNull().references(()=>conversations.id),
 sender:text("sender",{enum:["BOT","VISITOR","AGENT","SYSTEM"]}).notNull(),
 content:text("content").notNull(),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const auditEvents=sqliteTable("audit_events",{
 id:integer("id").primaryKey({autoIncrement:true}),
 conversationId:text("conversation_id").references(()=>conversations.id),
 actor:text("actor").notNull(),
 action:text("action").notNull(),
 details:text("details"),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const adminUsers=sqliteTable("admin_users",{
 id:text("id").primaryKey(),
 name:text("name").notNull(),
 email:text("email").notNull().unique(),
 passwordHash:text("password_hash").notNull(),
 role:text("role",{enum:["ADMIN","EDITOR"]}).notNull().default("EDITOR"),
 active:integer("active",{mode:"boolean"}).notNull().default(true),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const adminSessions=sqliteTable("admin_sessions",{
 id:text("id").primaryKey(),
 userId:text("user_id").notNull().references(()=>adminUsers.id),
 tokenHash:text("token_hash").notNull().unique(),
 expiresAt:text("expires_at").notNull(),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const passwordResetTokens=sqliteTable("password_reset_tokens",{
 id:text("id").primaryKey(),
 userId:text("user_id").notNull().references(()=>adminUsers.id),
 tokenHash:text("token_hash").notNull().unique(),
 expiresAt:text("expires_at").notNull(),
 usedAt:text("used_at"),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
