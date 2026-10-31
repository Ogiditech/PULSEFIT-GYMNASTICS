import { requireUser } from './_lib/auth.js'
import { getSql } from './_lib/db.js'
import { HttpError, route } from './_lib/http.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route({
  async GET(req) {
    await requireUser(req)
    const sql = getSql()
    const group = req.query?.muscle_group

    if (group && group !== 'All') {
      if (!GROUPS.includes(group)) throw new HttpError(400, 'Unknown muscle group.')
      return {
        exercises: await sql`
          SELECT * FROM exercises WHERE muscle_group = ${group} ORDER BY name`,
      }
    }
    return {
      exercises: await sql`
        SELECT * FROM exercises
        ORDER BY array_position(${GROUPS}::text[], muscle_group), name`,
    }
  },
})
