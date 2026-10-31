import { requireUser } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { HttpError, readBody, route, toInt } from '../_lib/http.js'

export default route({
  // { completed: true|false } — tick or untick a set in one of your unfinished workouts.
  async PATCH(req) {
    const user = await requireUser(req)
    const sql = getSql()
    const id = toInt(req.query?.id, 'set')
    const { completed } = readBody(req)
    if (typeof completed !== 'boolean') throw new HttpError(400, '"completed" must be true or false.')

    const [set] = await sql`
      UPDATE workout_sets s
      SET completed = ${completed}, completed_at = CASE WHEN ${completed} THEN now() ELSE NULL END
      FROM workout_exercises we, workouts w
      WHERE s.id = ${id} AND we.id = s.workout_exercise_id AND w.id = we.workout_id
        AND w.user_id = ${user.id} AND w.status <> 'completed'
      RETURNING s.id, s.set_number, s.completed, w.id AS workout_id`
    if (!set) throw new HttpError(404, 'Couldn’t update that set — the workout may already be finished.')

    // First tick starts the clock if the workout wasn't started yet.
    await sql`
      UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
      WHERE id = ${set.workout_id} AND user_id = ${user.id} AND status = 'planned'`

    return { set: { id: set.id, set_number: set.set_number, completed: set.completed } }
  },
})
