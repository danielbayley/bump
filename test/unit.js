import assert from "node:assert/strict"
import { describe, it, beforeEach, afterEach } from "node:test"
import { shell, readFile } from "#utils"
import { createFixture } from "fs-fixture"
import YAML from "yaml"
import semver from "semver"

const increment = "minor"
const indent = 2
const before = {
  version: "0.0.0",
  scripts: {
    version: "bump $npm_old_version $npm_new_version"
  }
}
const json = JSON.stringify(before, null, indent)
const yaml = YAML.stringify(before, { indent })

const bin  = "node_modules/.bin"
process.env.PATH += `:${import.meta.dirname}/../${bin}`

let fixtures, cwd
describe("`bump`", () => {
  beforeEach(async () => {
    fixtures = await createFixture({
      "package.json": json,
      "package.yaml": yaml,
    })
    cwd = fixtures.path
  })
  afterEach(() => fixtures.rm())

  it("`install`s a local `bump` binary", async () => {
    const which  = process.platform === "win32" ? "where" : "which"
    const stdout = await shell(`${which} bump`)
    assert.equal(stdout.endsWith(`${bin}/bump`), true)
  })

  it("`bump`s `version` in the local `package.json` file, given a single `version` argument", async () => {
    await fixtures.rm("package.yaml")
    const path    = fixtures.getPath("package.json")
    const before  = await readFile(path).then(JSON.parse)
    await shell(`bump ${increment}`, { cwd })
    const after   = await readFile(path).then(JSON.parse)
    const compare = semver.diff(before.version, after.version)
    assert.equal(compare, increment)
  })

  it(" or `package.yaml`, which takes precedence", async () => {
    const path    = fixtures.getPath("package.yaml")
    const before  = await readFile(path).then(YAML.parse)
    await shell(`bump ${increment}`, { cwd })
    const after   = await readFile(path).then(YAML.parse)
    const compare = semver.diff(before.version, after.version)
    assert.equal(compare, increment)
  })

  it("`bump`s `version` in the given file path", async () => {
    const path    = fixtures.getPath("package.yaml")
    const before  = await readFile(path).then(YAML.parse)
    await shell(`bump ${increment} ${path}`, { cwd })
    const after   = await readFile(path).then(YAML.parse)
    const compare = semver.diff(before.version, after.version)
    assert.equal(compare, increment)
  })

  it("`bump`s `version` from `JSON` over `stdin`", async () => {
    const command = `bump ${increment} <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    const compare = semver.diff(before.version, after.version)
    assert.equal(compare, increment)
  })

  it("`bump`s `version` from YAML over `stdin`", async () => {
    const command = `bump ${increment} <<< '${yaml}'`
    const after   = await shell(command).then(YAML.parse)
    const compare = semver.diff(before.version, after.version)
    assert.equal(compare, increment)
  })

  it("`bump`s from any `version` given 2 arguments", async () => {
    const version = "0.1.0"
    const command = `bump ${version} minor <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    assert.equal(after.version, "0.2.0")
  })

  it("`bump`s given a specific `version`", async () => {
    const version = "0.2.0"
    const command = `bump ${version} <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    assert.equal(after.version, version)
  })

  it("`bump`s `version` to `major` from `M` alias", async () => {
    const major   = semver.inc(before.version, "major")
    const command = `bump M <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    assert.equal(after.version, major)
  })

  it("`bump`s `version` to `minor` from `m` alias", async () => {
    const minor   = semver.inc(before.version, "minor")
    const command = `bump m <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    assert.equal(after.version, minor)
  })

  it("`bump`s `version` to `patch` from `p` alias", async () => {
    const patch   = semver.inc(before.version, "patch")
    const command = `bump p <<< '${json}'`
    const after   = await shell(command).then(JSON.parse)
    assert.equal(after.version, patch)
  })
})
