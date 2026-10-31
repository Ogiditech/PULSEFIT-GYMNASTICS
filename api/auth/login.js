import bcrypt from 'bcryptjs'
import { publicUser, setSession } from '../_lib/auth.js'
import { getSql } from '../_lib/db.js'
import { HttpError, readBody, route } from '../_lib/http.js'

export default route({
  async POST(req, res) {
    const body = readBody(req)
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    if (!email || !password) throw new HttpError(400, 'Enter your email and password.')

    const sql = getSql()
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    const ok = user && (await bcrypt.compare(password, user.password_hash))
    if (!ok) throw new HttpError(401, 'That email and password don’t match. Give it another go.', 'BAD_CREDENTIALS')

    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
