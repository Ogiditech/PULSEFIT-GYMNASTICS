import { requireUser } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { HttpError, readBody, route, toInt } from '../_lib/http.js'

const COLUMNS = 'id, name, workout_date::text AS workout_date, status, duration_minutes, started_at, completed_at'

export default route({
  // { action: 'start' } or { action: 'complete' }
  async PATCH(req) {
    const user = await requireUser(req)
    const sql = getSql()
    const id = toInt(req.query?.id, 'workout')
    const { action } = readBody(req)

    const [existing] = await sql`SELECT id, status FROM workouts WHERE id = ${id} AND user_id = ${user.id}`
    if (!existing) throw new HttpError(404, 'Workout not found.')

    if (action === 'start') {
      const [w] = await sql.query(
        `UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
         WHERE id = $1 AND user_id = $2 AND status = 'planned' RETURNING ${COLUMNS}`,
        [id, user.id],
      )
      if (w) return { workout: w }
      const [current] = await sql.query(`SELECT ${COLUMNS} FROM workouts WHERE id = $1`, [id])
      return { workout: current }
    }

    if (action === 'complete') {
      if (existing.status === 'completed') throw new HttpError(409, 'This workout is already finished.')
      const [{ done }] = await sql`
        SELECT count(*)::int AS done FROM workout_sets s
        JOIN workout_exercises we ON we.id = s.workout_exercise_id
        WHERE we.workout_id = ${id} AND s.completed`
      if (done === 0) throw new HttpError(400, 'Tick off at least one set before finishing.')

      // Duration comes from the server clock (started_at → now), not the browser.
      const [w] = await sql.query(
        `UPDATE workouts
         SET status = 'completed', completed_at = now(),
             started_at = COALESCE(started_at, now()),
             duration_minutes = GREATEST(1, CEIL(EXTRACT(EPOCH FROM now() - COALESCE(started_at, now())) / 60))::int
         WHERE id = $1 AND user_id = $2 AND status <> 'completed'
         RETURNING ${COLUMNS}`,
        [id, user.id],
      )
      return { workout: w }
    }

    throw new HttpError(400, 'Unknown action. Use "start" or "complete".')
  },
})
