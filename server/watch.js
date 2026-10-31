// Runs server/dev-server.js and restarts it when files in api/ or server/ change.
// (Node's own --watch-path also reacts to node_modules and .pgdata on Windows.)
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ENTRY = path.join(ROOT, 'server', 'dev-server.js')

let child
let timer

function start() {
  child = spawn(process.execPath, [...process.execArgv, ENTRY], { stdio: 'inherit', env: process.env })
}

function restart(file) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    console.log(`↻ ${file} changed — restarting API`)
    if (!child || child.exitCode !== null) return start()
    child.once('exit', start)
    child.kill()
  }, 150)
}

for (const dir of ['api', 'server']) {
  watch(path.join(ROOT, dir), { recursive: true }, (_event, file) => {
    if (file && file.endsWith('.js')) restart(`${dir}/${file.replace(/\\/g, '/')}`)
  })
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    child?.kill()
    process.exit(0)
  })
}

start()
