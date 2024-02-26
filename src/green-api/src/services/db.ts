import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Redis from "ioredis";
import { schema } from "sage-pg-db";

const redisUrl = "rediss://default:AVNS_Hoa2D-Rffaau1BgTBmX@db-redis-nyc-green-app-1-do-user-4808527-0.c.db.ondigitalocean.com:25061"
export const client = new Redis(redisUrl)

export const sql = postgres(process.env['POSTGRES_URL'] as string)
export const db = drizzle(sql, { schema: schema });

