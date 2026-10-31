// Shared queries for workouts. Every query is scoped by user_id.

export async function getTodayWorkout(sql, userId, today) {
  // Prefer an unfinished workout for today; otherwise the most recent finished one.
  const [w] = await sql`
    SELECT id, name, workout_date::text AS workout_date, status, duration_minutes, started_at, completed_at
    FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${today}
    ORDER BY (status = 'completed') ASC, id DESC
    LIMIT 1`
  if (!w) return null
  return { ...w, exercises: await getWorkoutExercises(sql, w.id) }
}

export async function getWorkoutExercises(sql, workoutId) {
  return sql`
    SELECT we.id AS workout_exercise_id, we.order_index,
           e.id AS exercise_id, e.name, e.muscle_group, e.reps, e.difficulty, e.rest_seconds,
           COALESCE(
             json_agg(json_build_object('id', s.id, 'set_number', s.set_number, 'completed', s.completed)
                      ORDER BY s.set_number) FILTER (WHERE s.id IS NOT NULL),
             '[]'
           ) AS sets
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${workoutId}
    GROUP BY we.id, e.id
    ORDER BY we.order_index, we.id`
}

/** Rough session length: ~40s of work per set plus the prescribed rest. */
export function estimateMinutes(exercises) {
  const secs = exercises.reduce((a, e) => a + e.sets.length * (40 + e.rest_seconds), 0)
  return Math.max(1, Math.round(secs / 60))
}

export function workoutName(groups) {
  const unique = [...new Set(groups)]
  if (unique.length === 0) return 'Today’s Workout'
  if (unique.length === 1) return unique[0] === 'Cardio' ? 'Cardio Blast' : `${unique[0]} Day`
  if (unique.length === 2) return `${unique[0]} & ${unique[1]}`
  return 'Full Body Power'
}

/** Current streak (ending today or yesterday) and best-ever streak from completed workout dates. */
export async function getStreaks(sql, userId, today) {
  const rows = await sql`
    SELECT DISTINCT workout_date::text AS d FROM workouts
    WHERE user_id = ${userId} AND status = 'completed' AND workout_date <= ${today}
    ORDER BY d DESC`
  const days = rows.map((r) => Date.parse(`${r.d}T00:00:00Z`) / 86_400_000)
  const todayN = Date.parse(`${today}T00:00:00Z`) / 86_400_000

  let current = 0
  if (days.length && todayN - days[0] <= 1) {
    current = 1
    while (current < days.length && days[current - 1] - days[current] === 1) current++
  }

  let best = 0
  let run = 0
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i - 1] - days[i] === 1 ? run + 1 : 1
    best = Math.max(best, run)
  }
  return { streak: current, bestStreak: best }
}
