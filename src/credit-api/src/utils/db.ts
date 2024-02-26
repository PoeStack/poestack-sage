import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres'
import { schema } from "sage-pg-db";

export const sql = postgres(process.env['POSTGRES_URL'] as string)
export const db = drizzle(sql, { schema: schema });
