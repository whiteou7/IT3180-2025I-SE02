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