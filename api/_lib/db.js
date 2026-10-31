import { neon } from '@neondatabase/serverless'
import pg from 'pg'
import { HttpError } from './http.js'

let sql

function isLocal(url) {
  try {
    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(new URL(url).hostname)
  } catch {
    return false
  }
}

// Local Postgres via node-postgres, exposed with the same API as Neon's driver:
// sql`... ${value}` and sql.query(text, params), both resolving to row arrays.
function localSql(url) {
  const pool = new pg.Pool({ connectionString: url, max: 5 })
  const run = (text, params) => pool.query(text, params).then((r) => r.rows)
  const tag = (strings, ...values) => run(strings.reduce((acc, s, i) => `${acc}$${i}${s}`), values)
  tag.query = run
  return tag
}

/**
 * Returns the SQL tagged-template function. Uses Neon's HTTP driver for Neon
 * (Vercel) and node-postgres for a local database during development.
 */
export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new HttpError(500, 'The server is missing its DATABASE_URL setting.', 'DB_NOT_CONFIGURED')
  sql ??= isLocal(url) ? localSql(url) : neon(url)
  return sql
}
