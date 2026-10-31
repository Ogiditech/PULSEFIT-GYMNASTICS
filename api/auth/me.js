import { getUserId, publicUser } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { route, userToday } from '../_lib/http.js'
import { getStreaks } from '../_lib/workouts.js'

// Returns { user: null } when logged out (200, so the browser console stays clean).
export default route({
  async GET(req) {
    const id = await getUserId(req)
    if (!id) return { user: null }

    const sql = getSql()
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`
    if (!user) return { user: null }

    const [[totals], streaks] = await Promise.all([
      sql`SELECT count(*)::int AS workouts, COALESCE(sum(duration_minutes), 0)::int AS minutes
          FROM workouts WHERE user_id = ${id} AND status = 'completed'`,
      getStreaks(sql, id, userToday(req)),
    ])

    return {
      user: publicUser(user),
      stats: { ...streaks, totalWorkouts: totals.workouts, totalMinutes: totals.minutes },
    }
  },
})
