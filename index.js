#! /usr/bin/env node
import fs from "node:fs/promises"
import { newline, invert, stdin, readFile, parse, stringify } from "#utils"

let {
  npm_config_init_version,
  npm_package_version,
  npm_old_version = npm_config_init_version ?? npm_package_version,
  npm_new_version,
  TABSIZE,
} = process.env

const aliases = invert({
  major: ["M", "Maj", "maj"],
  minor: ["m", "min"],
  patch: ["p"],
})

const resolve = arg => aliases[arg] ?? arg

// https://eemeli.org/yaml#tostring-options
const options = {
  indent: parseInt(TABSIZE) || 2,
  indentSeq: false,
  flowCollectionPadding: false,
}

// https://github.com/pnpm/pnpm/pull/1799
const files = ["package.yaml", "package.json"]
const match = path => files.some(file => path.endsWith(file))
const args  = process.argv.slice(2)

let [version, increment, path] = args.map(resolve)

path ??= args.find(match)

switch (args.length) {
  case 1:
    if (path == null) increment = version
    version = undefined
  case 2: if (path) {
    increment = version
    version = undefined
  }
  case 3: npm_old_version = version
}

const by = (a, b) => files.indexOf(a) - files.indexOf(b)

path ??= await fs.readdir(".").then(ls => ls.sort(by).find(match))

const stdinput = await stdin()
const raw = stdinput || await readFile(path)
const metadata = await parse(raw)

npm_old_version ??= metadata.get("version") ?? "0.0.0"

if (increment == null || increment in aliases) {
  const { valid, inc } = await import("semver")
  increment ??= valid(version) ? version : aliases[version] ?? "patch"
  npm_new_version ??= inc(npm_old_version, increment)
}

npm_new_version ??= increment
metadata.set("version", npm_new_version)

let rewrite = stringify(metadata, options)
if (raw.endsWith(newline)) rewrite += newline

if (stdinput.length === 0) await fs.writeFile(path, rewrite)
else console.log(rewrite)
