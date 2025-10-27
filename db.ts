import postgres from "postgres"
import "dotenv/config"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined")
}
const db = postgres(process.env.DATABASE_URL, {
  prepare: false,
  transform: {
    column: (col) => {
      // convert snake_case to camelCase
      return col.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
    },
  },
})

export { db }

import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("DATABASE_URL environment variable is not defined")
}
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_KEY

export const storage = createClient(supabaseUrl, supabaseAnonKey).storage