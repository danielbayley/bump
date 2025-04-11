import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  shell,
  invert,
  stdin,
  parse,
  stringify,
  SystemError,
} from "#utils"

describe("`utils`", async () => {
  describe("`shell`", () => {
    it("`return`s `stdout`", async () => {
      const string = "string"
      const stdout = await shell(`echo ${string}`)
      assert.equal(stdout, string)
    })

    it("else `return`s `stderr` as `SystemError`", async () => {
      const {constructor} = await shell("exit 1")
      assert.equal(constructor, SystemError)
    })
  })

  describe("`invert`", () => {
    const object   = { key: ["a", "b"] }
    const [key]    = Object.keys(object)
    const inverted = invert(object)

    it("`invert`s an `Object`, swapping it's `keys` and `values`", () =>
      assert.partialDeepStrictEqual(inverted, { a: key, b: key }))

    it("including the `key` itself", () =>
      assert.partialDeepStrictEqual(inverted, { key }))
  })

  describe("`stdin`", () => {
    const script = `
    import {setTimeout} from "node:timers/promises"
    const stdin = ${stdin}
    stdin().then(console.log)
    `
    it("reads from `stdin`", async () => {
      const stdin  = "stdin"
      const stdout = await shell(`node --eval '${script}' <<< ${stdin}`)
      assert.equal(stdout, stdin)
    })

    it("`return`s a blank `String` if no `stdin`", async () => {
      const stdout = await stdin()
      assert.equal(stdout.length, 0)
    })

    const timeout = 1000
    it("takes a timeout argument", {timeout}, async () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), timeout / 10)
      const stdout = await stdin(timeout, controller.signal)
      assert.equal(stdout.length, 0)
    })
  })

  const key  = "value"
  const json = JSON.stringify({ key })
  const yaml = `---\nkey: ${key}`
  const doc  = await parse(yaml)
  const map  = await parse(json)

  describe("`parse`", () => {
    it("`parse`s `JSON` as `Map`", () =>
      assert.equal(map.get("key"), key))

    it("`parse`s YAML document", () =>
      assert.equal(doc.get("key"), key))

    it("including `<<` merge keys", async () => {
      const yaml = `
        object: &merge
          key: ${key}
        merged:
          <<: *merge
      `
      const doc = await parse(yaml)
      const {merged} = doc.toJS()
      assert.equal(key, merged.key)
    })
  })

  describe("`stringify`", () => {
    it("converts `JSON` to `String`", async () => {
      const string = await stringify(map, { indent: 0 })
      assert.equal(string, json)
    })

    it("converts YAML to `String`", async () => {
      const string = await stringify(doc)
      assert.equal(string.trimEnd(), yaml)
    })

    const indent = 3

    it("accepts an `indent` option", async () => {
      const string = await stringify(map, { indent })
      const [{ length }] = string.match(/^\s+/m)
      assert.equal(indent, length)
    })

    it("including for YAML", async () => {
      const yaml = `
        indent:
          key: ${key}
      `
      const doc    = await parse(yaml)
      const string = await stringify(doc, { indent })
      const [{ length }] = string.match(/^\s+/m)
      assert.equal(indent, length)
    })
  })
})
