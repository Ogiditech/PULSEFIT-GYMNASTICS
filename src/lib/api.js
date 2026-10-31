import { useCallback, useEffect, useRef, useState } from 'react'

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const SERVER_DOWN = 'We can’t reach the PulseFit server. Make sure “npm run dev” is running, then try again.'

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Timezone': TIME_ZONE },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(SERVER_DOWN, 0, 'NETWORK')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON (e.g. the dev proxy when the API isn't running) */
  }

  if (!res.ok) {
    if (!data?.error) throw new ApiError(res.status >= 500 ? SERVER_DOWN : `Request failed (${res.status}).`, res.status, 'NETWORK')
    throw new ApiError(data.error, res.status, data.code)
  }
  return data
}

/** Loads `path` on mount; returns { data, error, loading, reload, setData }. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const alive = useRef(true)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path)
      if (alive.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (alive.current) setState({ data: null, error, loading: false })
    }
  }, [path])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  }, [])

  return { ...state, reload: load, setData }
}
