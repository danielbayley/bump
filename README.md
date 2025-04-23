<img title="SemVer" alt="0.0.0" src="logo.svg" align="right" width="160vw"/>

`bump`
=====
Simple [CLI] command to `bump` your \[[`p`][`pnpm`]][`npm`][]
[`package.json`]/[`yaml`] [`version`][semver].

> [!NOTE]
> [`optionalDependencies`] are _[yaml]_ and _[semver]_. But no `dependencies`
> are necessary, if both `version`s are supplied as arguments, or if
> `npm_old_version` and `npm_new_version` are available, as is the case
> under the [`scripts`]`.`[`version`] runtime environment:
~~~ jsonc
// package.json
"scripts": {
  "version": "bump" // $npm_old_version $npm_new_version"
},
~~~
Also compatible with [`pnpm`][] [`package.yaml`][`yaml`]:
~~~ yaml
# package.yaml
scripts:
  version: bump # $npm_old_version $npm_new_version
~~~

API
---
> [!IMPORTANT]
> The default increment is `patch`, given no arguments:
~~~ sh
bump # 0.0.0 => 0.0.1
~~~

Possible keywords are the same availabe to the _[node-semver]_ [`inc`rement]
`function`, along with aliases provided for `M`[`aj`]or, `m`[`in`]or, and `p`atch:
~~~ sh
bump M # 0.0.0 => 1.0.0
bump m # 0.0.0 => 0.1.0
bump p # 0.0.0 => 0.0.1
~~~

Takes specific `version` argument(s):
~~~ sh
bump 0.1.0 minor # => 0.2.0
~~~

> [!NOTE]
> Applies update to [`stdout`][`stdin`], given input from [`stdin`]:
~~~ sh
bump < package.* | yq .version # 0.0.1
~~~

Directly via \[[`p`][pnpx]][`npx`]:
~~~ sh
npx @danielbayley/bump # 0.0.0 => 0.0.1
~~~

## Install
~~~ sh
npm install @danielbayley/bump
~~~
~~~ sh
pnpm add @danielbayley/bump
~~~

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                    LICENSE.md
[Daniel Bayley]:          https://github.com/danielbayley

[`pnpm`]:                 https://pnpm.io
[pnpx]:                   https://pnpm.io/cli/dlx
[`npx`]:                  https://docs.npmjs.com/cli/commands/npx
[`npm`]:                  https://npmjs.com
[`package.json`]:         https://docs.npmjs.com/cli/configuring-npm/package-json
[`yaml`]:                 https://github.com/pnpm/pnpm/pull/1799
[yaml]:                   https://eemeli.org/yaml#yaml
[semver]:                 https://semver.org
[node-semver]:            https://github.com/npm/node-semver#readme
[`inc`rement]:            https://github.com/npm/node-semver#functions
[`version`]:              https://docs.npmjs.com/cli/v11/using-npm/scripts#npm-version
[`scripts`]:              https://docs.npmjs.com/cli/using-npm/scripts
[`optionalDependencies`]: https://docs.npmjs.com/cli/v11/configuring-npm/package-json#optionaldependencies

[CLI]:                    https://wikipedia.org/wiki/Command-line_interface
[`stdin`]:                https://wikipedia.org/wiki/Standard_streams
