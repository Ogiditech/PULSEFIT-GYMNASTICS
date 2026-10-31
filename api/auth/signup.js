import bcrypt from 'bcryptjs'
import { publicUser, setSession } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { HttpError, readBody, route } from '../_lib/http.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default route({
  async POST(req, res) {
    const body = readBody(req)
    const fullName = String(body.full_name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const goalWorkouts = Number(body.weekly_goal_workouts ?? 4)
    const goalMinutes = Number(body.weekly_goal_minutes ?? 150)

    if (fullName.length < 2) throw new HttpError(400, 'Please tell us your name.')
    if (!EMAIL.test(email)) throw new HttpError(400, 'That email address doesn’t look right.')
    if (password.length < 8) throw new HttpError(400, 'Use at least 8 characters for your password.')
    if (!Number.isInteger(goalWorkouts) || goalWorkouts < 1 || goalWorkouts > 14)
      throw new HttpError(400, 'Weekly workout goal must be between 1 and 14.')
    if (!Number.isInteger(goalMinutes) || goalMinutes < 10 || goalMinutes > 3000)
      throw new HttpError(400, 'Weekly minutes goal must be between 10 and 3000.')

    const sql = getSql()
    const hash = await bcrypt.hash(password, 10)
    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at`
    if (!user) throw new HttpError(409, 'An account with that email already exists. Try logging in instead.', 'EMAIL_TAKEN')

    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
