import { jwtVerify, SignJWT } from 'jose'
import { getSql } from './db.js'
import { HttpError } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret() {
  if (!process.env.JWT_SECRET) throw new HttpError(500, 'The server is missing its JWT_SECRET setting.', 'AUTH_NOT_CONFIGURED')
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

function cookieAttrs(maxAge) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

function readCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export async function setSession(res, userId) {
  const token = await new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', `${COOKIE}=${token}${cookieAttrs(MAX_AGE)}`)
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=${cookieAttrs(0)}`)
}

/** Returns the logged-in user's id, or null. */
export async function getUserId(req) {
  const token = readCookie(req, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

/** Returns the logged-in user row or throws 401. Every user-data route goes through this. */
export async function requireUser(req) {
  const id = await getUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  const sql = getSql()
  const [user] = await sql`
    SELECT id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
    FROM users WHERE id = ${id}`
  if (!user) throw new HttpError(401, 'Your session has expired. Please log in again.', 'UNAUTHENTICATED')
  return user
}

export function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    weekly_goal_workouts: u.weekly_goal_workouts,
    weekly_goal_minutes: u.weekly_goal_minutes,
    created_at: u.created_at,
  }
}
