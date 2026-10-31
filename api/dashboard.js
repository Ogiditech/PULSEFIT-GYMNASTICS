import { requireUser } from './_lib/auth.js'
import { getSql } from './_lib/db.js'
import { route, userToday } from './_lib/http.js'
import { estimateMinutes, getStreaks, getTodayWorkout } from './_lib/workouts.js'

const KCAL_PER_MINUTE = 7.5 // rough average for mixed strength + cardio training

export default route({
  async GET(req) {
    const user = await requireUser(req)
    const sql = getSql()
    const today = userToday(req)

    const [todayWorkout, activity, [week], streaks] = await Promise.all([
      getTodayWorkout(sql, user.id, today),
      sql`
        WITH days AS (
          SELECT generate_series(${today}::date - 6, ${today}::date, interval '1 day')::date AS d
        )
        SELECT to_char(days.d, 'Dy') AS day, days.d::text AS date,
               COALESCE(sum(w.duration_minutes), 0)::int AS minutes,
               count(w.id)::int AS workouts
        FROM days
        LEFT JOIN workouts w
          ON w.user_id = ${user.id} AND w.status = 'completed' AND w.workout_date = days.d
        GROUP BY days.d
        ORDER BY days.d`,
      sql`
        SELECT count(*)::int AS workouts, COALESCE(sum(duration_minutes), 0)::int AS minutes
        FROM workouts
        WHERE user_id = ${user.id} AND status = 'completed'
          AND workout_date >= date_trunc('week', ${today}::date)::date
          AND workout_date <= ${today}::date`,
      getStreaks(sql, user.id, today),
    ])

    const goalsHit =
      (week.workouts >= user.weekly_goal_workouts ? 1 : 0) + (week.minutes >= user.weekly_goal_minutes ? 1 : 0)

    return {
      user: { full_name: user.full_name },
      today: todayWorkout && {
        ...todayWorkout,
        estimated_minutes: estimateMinutes(todayWorkout.exercises),
        estimated_kcal: Math.round(estimateMinutes(todayWorkout.exercises) * KCAL_PER_MINUTE),
      },
      activity: activity.map((d) => ({ ...d, kcal: Math.round(d.minutes * KCAL_PER_MINUTE) })),
      ...streaks,
      week: {
        workouts: week.workouts,
        minutes: week.minutes,
        goalsHit,
        goalsTotal: 2,
        goalWorkouts: user.weekly_goal_workouts,
        goalMinutes: user.weekly_goal_minutes,
      },
    }
  },
})
