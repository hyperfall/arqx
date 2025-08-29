import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolspecs = pgTable("toolspecs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  owner: uuid("owner").references(() => profiles.id),
  name: text("name").notNull(),
  spec: jsonb("spec").notNull(),
  public: boolean("public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  toolspecId: uuid("toolspec_id").references(() => toolspecs.id).notNull(),
});

export const telemetryEvents = pgTable("telemetry_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ts: timestamp("ts").notNull(),
  userId: uuid("user_id").references(() => profiles.id),
  type: text("type").notNull(),
  toolId: text("tool_id"),
  toolName: text("tool_name"),
  bytesIn: text("bytes_in"), // Store as text to handle large numbers
  bytesOut: text("bytes_out"),
  venue: text("venue"),
  durationMs: text("duration_ms"),
  errorCode: text("error_code"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export const insertToolspecSchema = createInsertSchema(toolspecs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites);

export const insertTelemetryEventSchema = createInsertSchema(telemetryEvents).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertToolspec = z.infer<typeof insertToolspecSchema>;
export type Toolspec = typeof toolspecs.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertTelemetryEvent = z.infer<typeof insertTelemetryEventSchema>;
export type TelemetryEvent = typeof telemetryEvents.$inferSelect;
