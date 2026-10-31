export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const DB_DOWN = /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|getaddrinfo|Connection terminated|password authentication failed|endpoint .* (?:could not be found|is disabled)|Couldn't connect|database system is (?:starting|shutting)/i

function isDbUnavailable(err) {
  const text = `${err?.code ?? ''} ${err?.message ?? ''} ${err?.cause?.message ?? ''} ${err?.cause?.code ?? ''}`
  return DB_DOWN.test(text)
}

/**
 * Wraps a Vercel-style handler map ({ GET, POST, ... }) with method routing and
 * friendly JSON errors. Works unchanged under Vercel and the local Express server.
 */
export function route(handlers) {
  return async function handler(req, res) {
    const fn = handlers[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
    try {
      const result = await fn(req, res)
      if (!res.headersSent) res.status(200).json(result ?? { ok: true })
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, code: err.code })
      }
      if (isDbUnavailable(err)) {
        console.error('[api] database unreachable:', err.message)
        return res.status(503).json({
          error: 'We can’t reach the PulseFit database right now. Check your internet connection and try again in a moment.',
          code: 'DB_UNAVAILABLE',
        })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.', code: 'SERVER_ERROR' })
    }
  }
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'Invalid JSON body.')
    }
  }
  return {}
}

export function toInt(value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `Invalid ${name}.`)
  return n
}

// The browser sends its IANA time zone so "today" and "this week" match the user's clock.
export function userToday(req) {
  let tz = req.headers['x-timezone']
  try {
    if (tz) new Intl.DateTimeFormat('en-US', { timeZone: tz })
  } catch {
    tz = undefined
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()) // YYYY-MM-DD
}
