import { requireUser } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { HttpError, readBody, route, toInt, userToday } from '../_lib/http.js'
import { getTodayWorkout, workoutName } from '../_lib/workouts.js'

async function renameWorkout(sql, workoutId) {
  const rows = await sql`
    SELECT e.muscle_group FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ${workoutId}
    ORDER BY we.order_index`
  await sql`UPDATE workouts SET name = ${workoutName(rows.map((r) => r.muscle_group))} WHERE id = ${workoutId}`
}

export default route({
  // Today's workout (with exercises and sets) for the logged-in user, or null.
  async GET(req) {
    const user = await requireUser(req)
    return { workout: await getTodayWorkout(getSql(), user.id, userToday(req)) }
  },

  // Add an exercise to today's workout, creating the workout if needed.
  async POST(req) {
    const user = await requireUser(req)
    const sql = getSql()
    const today = userToday(req)
    const exerciseId = toInt(readBody(req).exercise_id, 'exercise')

    const [exercise] = await sql`SELECT id, name, sets FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'That exercise doesn’t exist anymore.')

    let [workout] = await sql`
      SELECT id FROM workouts
      WHERE user_id = ${user.id} AND workout_date = ${today} AND status <> 'completed'
      ORDER BY id DESC LIMIT 1`
    if (!workout) {
      ;[workout] = await sql`
        INSERT INTO workouts (user_id, workout_date) VALUES (${user.id}, ${today}) RETURNING id`
    }

    try {
      // One statement, so the exercise and its sets are created atomically.
      await sql`
        WITH we AS (
          INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
          SELECT ${workout.id}, ${exercise.id}, COALESCE(max(order_index), -1) + 1
          FROM workout_exercises WHERE workout_id = ${workout.id}
          RETURNING id
        )
        INSERT INTO workout_sets (workout_exercise_id, set_number)
        SELECT we.id, gs FROM we, generate_series(1, ${exercise.sets}::int) AS gs`
    } catch (err) {
      if (err.code === '23505') throw new HttpError(409, `${exercise.name} is already in today’s workout.`, 'ALREADY_ADDED')
      throw err
    }

    await renameWorkout(sql, workout.id)
    return { workout: await getTodayWorkout(sql, user.id, today) }
  },

  // Remove an exercise from today's (unfinished) workout.
  async DELETE(req) {
    const user = await requireUser(req)
    const sql = getSql()
    const today = userToday(req)
    const exerciseId = toInt(req.query?.exercise_id, 'exercise')

    const removed = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.workout_id = w.id AND we.exercise_id = ${exerciseId}
        AND w.user_id = ${user.id} AND w.workout_date = ${today} AND w.status <> 'completed'
      RETURNING w.id AS workout_id`
    if (!removed.length) throw new HttpError(404, 'That exercise isn’t in today’s workout.')

    const workoutId = removed[0].workout_id
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM workout_exercises WHERE workout_id = ${workoutId}`
    if (n === 0) await sql`DELETE FROM workouts WHERE id = ${workoutId} AND user_id = ${user.id}`
    else await renameWorkout(sql, workoutId)

    return { workout: await getTodayWorkout(sql, user.id, today) }
  },
})
