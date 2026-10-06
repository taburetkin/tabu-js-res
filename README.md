# tabu-js-res

![size](https://img.shields.io/badge/size-4%20KB-0e7c86)
![dependencies](https://img.shields.io/badge/dependencies-none-2ea44f)
![tested](https://img.shields.io/badge/tested-node%3Atest%20%2B%20tsd-2ea44f)
![vanilla](https://img.shields.io/badge/vanilla-JavaScript-f7df1e?logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-declarations-3178c6?logo=typescript&logoColor=white)

## Contents

- [Reference](reference.md)
- [Why](#why)
  - [What it is good at](#what-it-is-good-at)
  - [Compared with other Result libraries](#compared-with-other-result-libraries)
  - [What it will not do for you](#what-it-will-not-do-for-you)
- [How to](#how-to)
  - [Install and import](#install-and-import)
  - [Where it runs](#where-it-runs)
  - [Build an ok or an error](#build-an-ok-or-an-error)
  - [Normalize a value](#normalize-a-value)
  - [init and mutate](#init-and-mutate)
  - [convertToRes](#converttores)
  - [Turn a call into a result](#turn-a-call-into-a-result)
  - [Call with arguments and this](#call-with-arguments-and-this)
  - [Use your own result objects](#use-your-own-result-objects)
  - [Bake that shape in with defineRes](#bake-that-shape-in-with-defineres)
  - [Options](#options)

## Why

`tabu-js-res` is a small Result for JavaScript. A finished operation is either ok, and it carries a value, or it is an error, and it carries that error. Both are plain objects you can return, pass, and store. Expected failure stays data. A throw is reserved for the boundary where some other code actually throws.

Two functions are that boundary. `syncRes` calls a function and returns a Result. `asyncRes` does the same and also waits for a promise. Anything thrown, and any rejected promise, comes back as an error result. The caller does not need its own `try/catch`.

```js
// before
try {
	const data = JSON.parse(text)
	use(data)
} catch (e) {
	report(e)
}

// after
const parsed = syncRes(() => JSON.parse(text))
parsed.ok ? use(parsed.value) : report(parsed.error)
```

When the values you already use are not `OkRes` and `ErrRes`, you can teach the same functions to build and recognize your objects. `defineRes` bakes those classes in, so the rest of the program keeps calling `OK`, `ERR`, `RES`, `syncRes`, and `asyncRes` without repeating the options.

The runtime is four JavaScript files and 4 KB, with no dependencies.

### What it is good at

- The surface is short: make a result, ask whether it is ok, and normalize a value that might already be one.
- An existing result of the kind you asked for is returned as the same object. `OK` of an ok result does not wrap it again. `RES` keeps both kinds.
- `OK` of an error result, and `ERR` of an ok result, flip it and reuse the payload.
- `syncRes` and `asyncRes` are the one place that turns a throw or a rejection into a result. A function that already returns a result is left as that result.
- Your own result shape works through `createOk`, `createErr`, and the functions that recognize it. `defineRes` remembers those and mixes them into every later call. A per-call option of the same name replaces the baked-in one for that call.
- The package is ESM, `sideEffects` is `false`, and `res`, `invoke`, and `define-res` can be imported on their own.
- TypeScript declarations are included. `isOk()` and `isErr()` narrow an `OkRes | ErrRes` union, so each branch sees only `value` or only `error`. `OK`, `ERR`, and `RES` keep the payload type, and they keep it when they flip a result. `syncRes` on a function is an ok of its return type or `ErrRes<unknown>`; `syncRes` on a plain value has no error case, because that value is not called. `invokeArgs` must match the function parameters and cannot be combined with `invokeArg`.

### Compared with other Result libraries

neverthrow, true-myth, ts-results, oxide.ts, and @badrap/result start from a constructor of their own Ok or Err. `OK`, `ERR`, and `RES` normalize a value, and the same functions can build your classes.

| Behavior | tabu-js-res | Those libraries |
| --- | --- | --- |
| Your classes | `defineRes` bakes `createOk`, `createErr`, and the matching readers into `OK`, `ERR`, `RES`, `syncRes`, and `asyncRes` | The result is their Ok or Err |
| Same reference | A result of the requested kind comes back as the same object | Each `ok()` / `err()` allocates a new one |
| Flip | The opposite kind is flipped and the payload is reused | A Result passed to `ok()` becomes the wrapped value |
| Call boundary | A function that already returns a Result is left as that Result | A successful return is wrapped in a new Ok |
| `init` and `mutate` | `init` runs on a new object. `mutate` runs when the same reference is returned | Construction always allocates a new object |
| Arguments and `this` | `invokeArg`, `invokeArgs`, `invokeContext`, and `shouldInvoke` belong to the call | Arguments and `this` are closed over before the wrapper |
| Success | Only `ok === true` | A class or a variant tag |
| Imports | `res`, then `invoke`, then `define-res` | One package entry |
| Types | A flip keeps the payload type. `syncRes` on a plain value has no error arm | Types describe their new Ok or Err |

### What it will not do for you

- It does not chain. There is no `map`, `flatMap`, or `match`. You read `ok` and branch.
- `syncRes` and `asyncRes` catch everything inside the boundary. A throw from your function becomes an error result, and so does a bad call setup: `invokeArgs` and `invokeArg` together, or `invokeArgs` that is not an array. Those mistakes do not crash the caller.
- A function passed as the second argument is an init callback. It runs only when a new result is created. It does not run when an existing result is returned unchanged. `mutate` runs only in that unchanged case. `defineRes` does not store `init` or `mutate`.
- If `shouldInvoke` returns false, the function is not called. The function itself is wrapped as an ok result.
- Success for a `Res` is only the boolean `true`. Any other flag is stored as an error.
- The declarations follow the runtime. They do not add `map` or `match`. A thrown value is `unknown`: the types do not invent an error type the function did not declare. Once `defineRes` is given custom factories, its results are typed as those factory return values, and the default `OkRes` / `ErrRes` payload tracking stays on the stock functions.

## How to

### Install and import

```bash
npm install tabu-js-res
```

```js
import { OK, ERR, RES, syncRes, asyncRes, defineRes } from 'tabu-js-res'
```

- `OK` makes an ok result. An existing ok result comes back as the same object. An error result is flipped, and its error becomes the value.
- `ERR` makes an error result. An existing error result comes back as the same object. An ok result is flipped, and its value becomes the error.
- `RES` keeps either kind unchanged. A bare value becomes ok.
- `syncRes` calls a function. A return value becomes ok. A throw becomes an error result.
- `asyncRes` does the same after waiting. A rejected promise becomes an error result.
- `defineRes` returns these functions with your own result classes already mixed in.

Each entry pulls in the ones above it. Import the smallest one that covers the call.

```js
// res — the minimum: OkRes, ErrRes, OK, ERR, RES
import { OK, ERR, RES, OkRes, ErrRes } from 'tabu-js-res/res'

// invoke — syncRes and asyncRes, plus res, which those functions call
import { syncRes, asyncRes } from 'tabu-js-res/invoke'

// define-res — defineRes, plus invoke and res. This is the whole library
import { defineRes } from 'tabu-js-res/define-res'
```

`invoke` and `define-res` do not re-export the names from `res`. Import `tabu-js-res/res` as well when the file needs `OK` or `OkRes` directly. That does not load `res` a second time.

### Where it runs

The modules are plain ECMAScript. They call no Node, DOM, or other host API, so the same files run in a browser, Node, Deno, Bun, and a worker. The tests in this repo run under Node.

The package is ESM only. A page loads it with `<script type="module">`, a bundler, or an import map. `require()` does not load it.

The syntax floor is a private field (`#ok`) plus `?.` and `??`. That is Node 14.6 or newer, and browsers from about 2021. There is no build step and no polyfill. An older engine fails to parse the file.

`instanceof Res` sees a result created in the same realm. A result from another iframe or worker fails that check. A custom `isRes` passed to `defineRes` recognizes your own objects across that boundary.

### Build an ok or an error

```js
import { OkRes, ErrRes } from 'tabu-js-res'

const saved = new OkRes({ id: 1 })
saved.ok        // true
saved.isOk()    // true
saved.value     // { id: 1 }
saved.error     // undefined

const missing = new ErrRes('not found')
missing.ok      // false
missing.isErr() // true
missing.error   // 'not found'
missing.value   // undefined
```

`OkRes` and `ErrRes` are both instances of `Res`. Check `ok` (or `isOk()` / `isErr()`) before reading `value` or `error`.

### Normalize a value

`OK`, `ERR`, and `RES` accept a bare value or a result you already have.

```js
import { OK, ERR, RES } from 'tabu-js-res'

const ok = OK({ id: 1 })
ok.value // { id: 1 }

const err = ERR('not found')
err.error // 'not found'

OK(ok) === ok     // already ok, same object
ERR(err) === err  // already an error, same object

OK(err).value     // 'not found'  — the error payload becomes the value
ERR(ok).error     // { id: 1 }    — the ok payload becomes the error

RES(ok) === ok
RES(err) === err
RES({ id: 2 }).value // { id: 2 }  — a bare value becomes ok
```

`RES` is the tolerant form. A result comes back unchanged, whichever kind it is. Anything else is wrapped as ok.

In TypeScript the same calls keep the payload type. `OK(ERR('missing'))` is `OkRes<string>`. On a union, `isOk()` and `isErr()` narrow the branch:

```ts
import { ERR, OK, type ErrRes, type OkRes } from 'tabu-js-res'

function take(result: OkRes<number> | ErrRes<string>) {
	if (result.isOk()) {
		result.value // number
	} else {
		result.error // string
	}
}

const flipped = OK(ERR('missing'))
// OkRes<string>
```

### `init` and `mutate`

`init` runs only for a result that was just created. A function in the second argument is `init`. Passing the same ok result back to `OK` returns it unchanged, so `init` does not run:

```js
import { OK } from 'tabu-js-res'

const seen = []
const created = OK(1, (result) => {
	seen.push(result.value)
})
seen // [1]

const skipped = []
OK(created, () => {
	skipped.push('init')
})
skipped // []
```

`mutate` is the other half. It runs only when an existing result is returned unchanged, and it does not run for a new one:

```js
let touched = null
OK(created, {
	mutate(result) { touched = result === created },
})
touched // true

let onCreate = false
OK(2, {
	mutate() { onCreate = true },
})
onCreate // false
```

### `convertToRes`

`isRes` can accept an object that is not your class. `convertToRes` then decides what to hand back. Return that same object and `mutate` runs. Return a different object and `init` runs on it. There is no default function. A flip does not call the hook, and `defineRes` does not store it.

```js
import { ERR, ErrRes, OK, OkRes } from 'tabu-js-res'

const foreign = { ok: true, value: 1 }
const isRes = (arg) => arg != null && typeof arg === 'object' && typeof arg.ok === 'boolean'

let inited = null
const local = OK(foreign, {
	isRes,
	convertToRes(arg) {
		if (arg instanceof OkRes || arg instanceof ErrRes) return arg
		return arg.ok ? new OkRes(arg.value) : new ErrRes(arg.error)
	},
	init(result) { inited = result },
})
local instanceof OkRes // true
local.value            // 1
inited === local       // true

let mutated = false
OK(local, {
	convertToRes(arg) { return arg },
	mutate() { mutated = true },
})
mutated // true

let called = false
OK(ERR('missing'), {
	convertToRes() { called = true },
})
called // false
```

### Turn a call into a result

`syncRes` runs a function. A return value becomes ok. A throw is passed to `ERR`: a non-result becomes the error payload, a thrown error result is kept, and a thrown ok result is flipped. A value that is not a function is wrapped as ok and is not called.

```js
import { syncRes } from 'tabu-js-res'

const parsed = syncRes(() => JSON.parse(text))

if (parsed.ok) {
	use(parsed.value)
} else {
	report(parsed.error)
}

syncRes(42).value // 42
```

If the function returns a result, that result is kept:

```js
import { ERR, OK, syncRes } from 'tabu-js-res'

const missing = syncRes(() => ERR('not found'))
missing.error // 'not found'

syncRes(() => { throw ERR('not found') }).error // 'not found'
syncRes(() => { throw OK(42) }).error // 42
```

`asyncRes` does the same after waiting. A rejected promise and a throw inside an async function both become an error result.

```js
import { asyncRes } from 'tabu-js-res'

const loaded = await asyncRes(() => fetch('/users/1').then((res) => {
	if (!res.ok) throw new Error(String(res.status))
	return res.json()
}))

if (loaded.ok) console.log(loaded.value)
else console.error(loaded.error)
```

A promise passed directly is waited for too:

```js
const body = await asyncRes(fetch('/users/1').then((res) => res.json()))
```

### Call with arguments and `this`

Pass one argument with `invokeArg`. Pass a list with `invokeArgs`. Set `this` with `invokeContext`. Use either `invokeArg` or `invokeArgs`, not both.

```js
import { syncRes } from 'tabu-js-res'

function add(a, b) {
	return a + b
}

syncRes(add, { invokeArgs: [2, 3] }).value // 5

function read() {
	return this.label
}

syncRes(read, { invokeContext: { label: 'local' } }).value // 'local'

function called(value) {
	return { args: arguments.length, value }
}

syncRes(called, { invokeContext: {}, invokeArg: undefined }).value
// { args: 1, value: undefined }

syncRes(called, { invokeContext: {} }).value
// { args: 0, value: undefined }
```

The key `invokeArg` passes that argument, including `undefined`. Without the key the function is called with no arguments. `this` is the same in both calls.

`asyncRes` takes the same options. The function may return a promise.

### Use your own result objects

The default classes are optional. On one call, pass the functions that build your objects and the functions that recognize them.

```js
import { OK, ERR, RES } from 'tabu-js-res'

const hooks = {
	createOk(value) { return { kind: 'ok', value } },
	createErr(error) { return { kind: 'err', error } },
	isRes(arg) { return arg != null && (arg.kind === 'ok' || arg.kind === 'err') },
	isResOk(arg) { return arg.kind === 'ok' },
	getValue(arg) { return arg.value },
	getError(arg) { return arg.error },
}

const saved = OK({ id: 1 }, hooks)
// { kind: 'ok', value: { id: 1 } }

const missing = ERR('not found', hooks)
// { kind: 'err', error: 'not found' }

OK(saved, hooks) === saved
RES(missing, hooks) === missing
OK(missing, hooks)
// { kind: 'ok', value: 'not found' }
```

`isRes` decides what already counts as a result. `isResOk` decides which of those are successes. `getValue` and `getError` are used when a result has to be flipped into the other kind. Without `isRes`, only instances of `Res` are recognized, and your object would be wrapped again.

### Bake that shape in with `defineRes`

`defineRes` returns `OK`, `ERR`, `RES`, `syncRes`, and `asyncRes` with those hooks already mixed in. Later calls do not repeat them.

```js
import { defineRes } from 'tabu-js-res'

const api = defineRes({
	createOk(value) { return { kind: 'ok', value } },
	createErr(error) { return { kind: 'err', error } },
	isRes(arg) { return arg != null && (arg.kind === 'ok' || arg.kind === 'err') },
	isResOk(arg) { return arg.kind === 'ok' },
	getValue(arg) { return arg.value },
	getError(arg) { return arg.error },
})

const saved = api.OK({ id: 1 })
const failed = api.syncRes(() => {
	throw new Error('disk full')
})
// { kind: 'err', error: Error('disk full') }

const loaded = await api.asyncRes(async (id) => {
	return { id }
}, { invokeArg: 7 })
// { kind: 'ok', value: { id: 7 } }
```

A hook passed on a single call replaces the baked-in one for that call. Pass `undefined` for a factory to use `OkRes` or `ErrRes` again:

```js
api.OK(1, {
	createOk(value) { return { tag: 'once', value } },
})
// { tag: 'once', value: 1 }

api.OK(1, { createOk: undefined })
// OkRes { value: 1 }
```

`defineRes` stores `createOk`, `createErr`, `isRes`, `isResOk`, `getValue`, and `getError`. It does not store anything else.

### Options

The second argument is a `ResOptions` object, or a function. A function is `init`. `defineRes` stores a `DefineResOptions` and does not store `init`, `mutate`, or `convertToRes`.

`OK`, `ERR`, and `RES` read `ResOptions`. `syncRes` and `asyncRes` read an `InvokeOptions`: that is `ResOptions` plus `shouldInvoke`, `invokeContext`, and either `invokeArgs` or `invokeArg`. On success they pass that object to `RES`. On a throw they pass it to `ERR`.

```ts
interface DefineResOptions<TOk = unknown, TErr = unknown> {
	createOk?: (value: unknown) => TOk
	createErr?: (error: unknown) => TErr
	isRes?: (arg: unknown) => boolean
	isResOk?: (arg: unknown) => boolean
	getValue?: (arg: unknown) => unknown
	getError?: (arg: unknown) => unknown
}

type ResOptions<R> = DefineResOptions & {
	init?: (result: R) => void
	mutate?: (result: AnyRes) => void
	convertToRes?: (arg: unknown, options: ResOptions) => unknown
}
```

`invokeArgs` and `invokeArg` cannot be set together. `invokeArg: undefined` still passes one argument, because the key is present. Without the key, the function is called with no arguments.

- `createOk` builds a new success. The default is `OkRes`.
- `createErr` builds a new failure. The default is `ErrRes`. An explicit `undefined` for either factory falls back to that default.
- `isRes` tells a result from any other value, so an existing result is not wrapped again. The default is `value instanceof Res`.
- `isResOk` tells which of those results are successes. The default reads `ok`.
- `getValue` reads the payload when an ok result is flipped into an error.
- `getError` reads the payload when an error result is flipped into an ok.
- `init` receives a result that was just created. It does not run when an existing result is returned unchanged.
- `mutate` receives an existing result that is returned unchanged. It does not run for a result that was just created.
- `convertToRes` runs only when `isRes` already accepted the value and the kind matches. Return the same object and `mutate` runs. Return a different object and `init` runs on that object. A flip does not call it. There is no default function.
- `shouldInvoke` decides whether to call the function. `false` skips the call and wraps the function itself as ok.
- `invokeContext` is `this` for the call.
- `invokeArgs` is the argument list.
- `invokeArg` is the single argument.

`defineRes` remembers only `createOk`, `createErr`, `isRes`, `isResOk`, `getValue`, and `getError`. The call fields, `init`, `mutate`, and `convertToRes` stay on the individual call. A field passed on that call replaces the remembered one for that call.
