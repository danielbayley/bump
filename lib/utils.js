import fs from "node:fs/promises"
import {exec} from "node:child_process"
import {promisify} from "node:util"
import {setTimeout} from "node:timers/promises"

export const newline = "\n"
export class SystemError extends Error {}

export const invert = object =>
  Object.entries(object).reduce((obj, [key, values]) => {
    [key, ...values].flat().forEach(v => obj[v] = key)
    return obj
  }, {})

export async function shell(command, options) {
  const sh = promisify(exec)
  const { stdout, stderr } = await sh(command, options)
    .catch(message => ({ stderr: new SystemError(message) }))
  return stdout?.trimEnd() ?? stderr
}

export const stdin = (timeout = 100, signal) =>
  new Promise((resolve, reject) => {
    signal ??= AbortSignal.timeout(timeout)
    const abort = () =>
      resolve("") ?? process.stdin.destroy()

    setTimeout(timeout, null, { ref: false, signal })
      .then(abort)
      .catch(abort)

    let content = ""
    process.stdin.on("data", line => content += line)
    process.stdin.on("error", reject)
    process.stdin.on("end", () => resolve(content.trimEnd()))
  })

export const readFile = path => fs.readFile(path, new TextDecoder)

export async function parse(content) {
  try {
    const object  = JSON.parse(content)
    const entries = Object.entries(object)
    return new Map(entries)
  } catch (error) {
    const {parseDocument} = await import("yaml")
    return parseDocument(content, { merge: true })
  }
}

export function stringify(map, options = {}) {
  options.indent ??= 2
  try {
    const object = Object.fromEntries(map)
    return JSON.stringify(object, null, options.indent)
  } catch (error) {
    options.indent ||= 1
    return map.toString(options)
  }
}
