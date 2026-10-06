# tabu-js-res

Reference for the public exports. The tour, from the smallest call to your own classes, is in [README.md](README.md).

The root import `tabu-js-res` exports every name below. `tabu-js-res/res` exports the classes, [`OK`](#OK), [`ERR`](#ERR), [`RES`](#RES), and the result types. `tabu-js-res/invoke` exports [`syncRes`](#syncRes), [`asyncRes`](#asyncRes), and the invoke types. `tabu-js-res/define-res` exports [`defineRes`](#defineRes) and its types. A subpath does not re-export names from the layer under it.

`KeptOk`, `KeptErr`, and `KeptRes` appear in the signatures and are not exports. Each function section says which case they pick.

## Contents

### Minimal API

| Export | |
| --- | --- |
| [`OK`](#OK) | Normalizes `value` into an ok result. |
| [`ERR`](#ERR) | Normalizes `error` into an error result. |
| [`RES`](#RES) | Keeps a result of either kind. A bare value becomes ok. |

### Call boundary

| Export | |
| --- | --- |
| [`syncRes`](#syncRes) | Calls `fn` and returns a result. A throw becomes an error result. |
| [`asyncRes`](#asyncRes) | Waits, then does what [`syncRes`](#syncRes) does. A rejection becomes an error result. |

### Custom classes

| Export | |
| --- | --- |
| [`defineRes`](#defineRes) | Returns [`OK`](#OK), [`ERR`](#ERR), [`RES`](#RES), [`syncRes`](#syncRes), and [`asyncRes`](#asyncRes) with your classes already mixed in. |

### Classes

| Export | |
| --- | --- |
| [`Res`](#Res) | A result whose success flag is exactly `true`, with `value` or `error` set from that flag. |
| [`OkRes`](#OkRes) | A success. `ok` is `true`, `value` holds the payload, `error` is `undefined`. |
| [`ErrRes`](#ErrRes) | A failure. `ok` is `false`, `error` holds the payload, `value` is `undefined`. |

### Types

| Export | |
| --- | --- |
| [`AnyRes`](#AnyRes) | An ok or error result whose payload is unknown. |
| [`ResInit`](#ResInit) | The `init` callback, and the function form of the second argument. |
| [`DefineResOptions`](#DefineResOptions) | The six class fields [`defineRes`](#defineRes) stores. |
| [`ResOptions`](#ResOptions) | Options for one call of [`OK`](#OK), [`ERR`](#ERR), or [`RES`](#RES). |
| [`ResArg`](#ResArg) | The second argument of [`OK`](#OK), [`ERR`](#ERR), and [`RES`](#RES). |
| [`InvokeFields`](#InvokeFields) | `shouldInvoke` and `invokeContext`. |
| [`InvokeOptions`](#InvokeOptions) | Options for one call of [`syncRes`](#syncRes) or [`asyncRes`](#asyncRes), including the argument list. |
| [`InvokeArg`](#InvokeArg) | The second argument of [`syncRes`](#syncRes) and [`asyncRes`](#asyncRes) when the first argument is called. |
| [`DefinedRes`](#DefinedRes) | The five functions [`defineRes`](#defineRes) returns when you do not pass your own factories. |
| [`CustomDefinedRes`](#CustomDefinedRes) | The five functions [`defineRes`](#defineRes) returns when a factory replaces [`OkRes`](#OkRes) or [`ErrRes`](#ErrRes). |

<a id="OK"></a>

## OK

```ts
function OK<T>(value: T, options?: ResArg<KeptOk<T>>): KeptOk<T>
```

Normalizes `value` into an ok result.

### Accepts

`value` is a payload, an ok result, or an error result.

`options` is a [`ResArg`](#ResArg): a [`ResOptions`](#ResOptions) object, or a function. A function becomes `{ init: options }`. `null`, a missing argument, and an `init` that is not a function leave the defaults in place. The defaults build an [`OkRes`](#OkRes), recognize `instanceof` [`Res`](#Res), read `ok`, and read `value` or `error`.

### Returns

`KeptOk<T>` depends on what `T` already is.

- A plain `T` becomes [`OkRes<T>`](#OkRes). `init` runs on that new object.
- An [`OkRes<V>`](#OkRes) comes back as the same reference. `mutate` runs. `init` does not. The type is [`OkRes<V>`](#OkRes).
- An [`ErrRes<E>`](#ErrRes) is flipped. The error payload is read with `getError` and passed to `createOk`. The type is [`OkRes<E>`](#OkRes). `init` runs on the new object.
- A bare [`Res<V, E>`](#Res) might be either kind. The type is [`Res<V, E>`](#Res) or [`OkRes<E>`](#OkRes): the same object when it was already ok, or a new [`OkRes`](#OkRes) of the error payload when it was not.

A `createOk` passed on this call replaces the default factory at runtime. The return type of this stock [`OK`](#OK) stays `KeptOk<T>`. The typed factory return shows up on the functions from [`defineRes`](#defineRes).

`convertToRes`, when it is a function, runs on an ok result before [`mutate`](#ResOptions) or [`init`](#ResInit). The same reference comes back and `mutate` runs. A different object comes back and `init` runs on that object. An [`ErrRes`](#ErrRes) still flips through `getError` and `createOk`, and `convertToRes` is not called. There is no default function. The return type stays `KeptOk<T>`.


<small><a href="#contents">to contents</a></small>

<a id="ERR"></a>

## ERR

```ts
function ERR<T>(error: T, options?: ResArg<KeptErr<T>>): KeptErr<T>
```

Normalizes `error` into an error result.

### Accepts

`error` is a payload, an error result, or an ok result.

`options` is a [`ResArg`](#ResArg), with the same function form and the same defaults as [`OK`](#OK).

### Returns

`KeptErr<T>` depends on what `T` already is.

- A plain `T` becomes [`ErrRes<T>`](#ErrRes). `init` runs on that new object.
- An [`ErrRes<E>`](#ErrRes) comes back as the same reference. `mutate` runs. `init` does not. The type is [`ErrRes<E>`](#ErrRes).
- An [`OkRes<V>`](#OkRes) is flipped. The value is read with `getValue` and passed to `createErr`. The type is [`ErrRes<V>`](#ErrRes). `init` runs on the new object.
- A bare [`Res<V, E>`](#Res) might be either kind. The type is [`Res<V, E>`](#Res) or [`ErrRes<V>`](#ErrRes).

A `createErr` passed on this call replaces the default factory at runtime. The return type of this stock [`ERR`](#ERR) stays `KeptErr<T>`.

`convertToRes` follows the same rule as on [`OK`](#OK). It runs for an error result that is already an error. An [`OkRes`](#OkRes) still flips through `getValue` and `createErr`, and the hook is not called. The return type stays `KeptErr<T>`.


<small><a href="#contents">to contents</a></small>

<a id="RES"></a>

## RES

```ts
function RES<T>(value: T, options?: ResArg<KeptRes<T>>): KeptRes<T>
```

Keeps a result of either kind. A value that is not a result becomes ok.

### Accepts

`value` is a payload or a result.

`options` is a [`ResArg`](#ResArg), with the same function form and the same defaults as [`OK`](#OK). [`RES`](#RES) does not ask for a kind, so both ok and error results count as already finished.

### Returns

`KeptRes<T>` is `T` when `T` extends [`Res`](#Res), and [`OkRes<T>`](#OkRes) otherwise.

- An [`OkRes`](#OkRes) or [`ErrRes`](#ErrRes) comes back as the same reference. `mutate` runs. `init` does not.
- A plain value becomes [`OkRes<T>`](#OkRes) through `createOk`. `init` runs.
- If `isRes` returns false, the value is not treated as a result. An existing [`OkRes`](#OkRes) is then wrapped, and the new ok result's value is that object.

`convertToRes` runs for either kind, because [`RES`](#RES) does not ask for one. A plain value does not go through the hook. The same reference runs `mutate`. A different object runs `init`. The return type stays `KeptRes<T>`.


<small><a href="#contents">to contents</a></small>

<a id="syncRes"></a>

## syncRes

```ts
function syncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => T,
	options?: InvokeArg<KeptRes<T> | ErrRes<unknown>, A>,
): KeptRes<T> | ErrRes<unknown>

function syncRes<T>(
	value: T,
	options?: ResArg<KeptRes<T>>,
): KeptRes<T>
```

Calls a function and returns a result. A throw becomes an error result and does not escape, except for one case under `init` below.

### Accepts

When `fn` is a function, `options` is an [`InvokeArg`](#InvokeArg). The call fields are [`InvokeFields`](#InvokeFields), `invokeArgs`, and `invokeArg`. The result fields are a [`ResOptions`](#ResOptions). A function in this position is `init`.

When `fn` is not a function, it is not called. Invoke fields on `options` are ignored. `options` is then a [`ResArg`](#ResArg) passed to [`RES`](#RES).

`shouldInvoke`, when it is a function and returns false, skips the call. The function itself is what [`RES`](#RES) wraps. The declared return type stays the type of a real call. It does not become an [`OkRes`](#OkRes) of the function.

### Returns

A return value goes through [`RES`](#RES), so a returned result stays that result and a plain value becomes ok. A throw goes through [`ERR`](#ERR): a thrown error result stays that result, a thrown ok result is flipped, and anything else becomes the error payload. The error type on this arm is `unknown`. The declaration does not invent an error type the function did not write down.

If `init` throws while building the ok result, that throw is caught and turned into an error result, and `init` runs again on that error result. If `init` throws the second time as well, that second throw leaves [`syncRes`](#syncRes).

`invokeArgs` together with `invokeArg`, or an `invokeArgs` that is not an array, throws inside the boundary. [`syncRes`](#syncRes) returns that as an error result.

The two overloads split on the first argument. A function uses the first and may return [`ErrRes<unknown>`](#ErrRes). A plain value uses the second and has no error arm, because nothing is called.


<small><a href="#contents">to contents</a></small>

<a id="asyncRes"></a>

## asyncRes

```ts
function asyncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => PromiseLike<T>,
	options?: InvokeArg<KeptRes<T> | ErrRes<unknown>, A>,
): Promise<KeptRes<T> | ErrRes<unknown>>

function asyncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => T,
	options?: InvokeArg<KeptRes<Awaited<T>> | ErrRes<unknown>, A>,
): Promise<KeptRes<Awaited<T>> | ErrRes<unknown>>

function asyncRes<T>(
	value: T,
	options?: ResArg<KeptRes<Awaited<T>> | ErrRes<unknown>>,
): Promise<KeptRes<Awaited<T>> | ErrRes<unknown>>
```

Waits, then normalizes the same way [`syncRes`](#syncRes) does.

### Accepts

The first argument is a function, a promise, a thenable, or a plain value. A function receives an [`InvokeArg`](#InvokeArg). A value that is not called receives a [`ResArg`](#ResArg), and invoke fields are ignored.

### Returns

A promise of a result. The function's return value is awaited, then passed to [`RES`](#RES). A thrown exception and a rejected promise are passed to [`ERR`](#ERR). The awaited payload is unwrapped in the type: a `Promise<number>` becomes an ok of `number`, not an ok of the promise.

A result returned from an async function is kept, and `init` does not run for it. The `init` rule about a second throw is the same as for [`syncRes`](#syncRes).

The value overload is still a promise of `KeptRes<Awaited<T>>` or [`ErrRes<unknown>`](#ErrRes). A promise or a thenable can reject, so the error arm stays. A plain non-promise value does not reject, and the type does not drop that arm the way the plain-value overload of [`syncRes`](#syncRes) does.


<small><a href="#contents">to contents</a></small>

<a id="defineRes"></a>

## defineRes

```ts
function defineRes<TOk, TErr>(
	options: DefineResOptions<TOk, TErr> & {
		createOk: (value: unknown) => TOk
		createErr: (error: unknown) => TErr
	},
): CustomDefinedRes<TOk, TErr>

function defineRes<TOk>(
	options: DefineResOptions<TOk, ErrRes<unknown>> & {
		createOk: (value: unknown) => TOk
		createErr?: undefined
	},
): CustomDefinedRes<TOk, ErrRes<unknown>>

function defineRes<TErr>(
	options: DefineResOptions<OkRes<unknown>, TErr> & {
		createOk?: undefined
		createErr: (error: unknown) => TErr
	},
): CustomDefinedRes<OkRes<unknown>, TErr>

function defineRes(options?: DefineResOptions): DefinedRes
```

Returns the five functions with your class fields already filled in, so later calls do not repeat them.

### Accepts

`options` is a [`DefineResOptions`](#DefineResOptions). The fields it stores are `createOk`, `createErr`, `isRes`, `isResOk`, `getValue`, and `getError`. `init`, `mutate`, `convertToRes`, and the invoke fields are not stored. Passing them is a type error, and at runtime they are dropped.

Omitted fields stay on the default classes. An empty object and a missing argument both return the stock functions, typed as [`DefinedRes`](#DefinedRes).

### Returns

An object with [`OK`](#OK), [`ERR`](#ERR), [`RES`](#RES), [`syncRes`](#syncRes), and [`asyncRes`](#asyncRes).

Each function calls the stock one with your stored fields mixed under the call's own options. A field on the call replaces the stored one for that call. A function passed as the second argument is `init` and does not wipe the stored fields. An explicit `undefined` factory falls back to [`OkRes`](#OkRes) or [`ErrRes`](#ErrRes), because the stock code treats a missing factory with `??`.

When both factories are present, both [`OK`](#OK) and [`ERR`](#ERR) are typed as those return values. That is [`CustomDefinedRes`](#CustomDefinedRes). The stock `KeptOk` rules stay on the stock functions, not on these wrappers. With only `createOk`, [`ERR`](#ERR) stays [`ErrRes<unknown>`](#ErrRes). With only `createErr`, [`OK`](#OK) stays [`OkRes<unknown>`](#OkRes).


<small><a href="#contents">to contents</a></small>

<a id="Res"></a>

## Res

```ts
class Res<V = unknown, E = unknown> {
	readonly value: V | undefined
	readonly error: E | undefined
	get ok(): boolean
	constructor(ok: boolean, arg: V | E)
	isOk(): this is OkRes<V>
	isErr(): this is ErrRes<E>
}
```

The base result. [`OkRes`](#OkRes) and [`ErrRes`](#ErrRes) extend it. Call [`OK`](#OK), [`ERR`](#ERR), or [`RES`](#RES) rather than `new` [`Res`](#Res).

### Accepts

`constructor(ok, arg)`. `ok` is the success flag. `arg` is the payload.

### Returns

The instance stores `arg` on `value` when `ok === true`, and on `error` otherwise. The getter `ok` is that same check. `1`, `"yes"`, and any other truthy flag are failures: the payload sits on `error`, and `value` stays `undefined`.

`isOk()` and `isErr()` read `ok`. On an [`OkRes`](#OkRes) | [`ErrRes`](#ErrRes) union the subclass predicates narrow the branch, so the ok branch sees `value` and the error branch sees `error`. On a bare [`Res`](#Res), `new` with `true` and a payload is a success at runtime and is not an `instanceof` [`OkRes`](#OkRes). The base predicate is still declared as `this is` [`OkRes<V>`](#OkRes).


<small><a href="#contents">to contents</a></small>

<a id="OkRes"></a>

## OkRes

```ts
class OkRes<V = unknown> extends Res<V, never> {
	get ok(): true
	readonly value: V
	readonly error: undefined
	constructor(value: V)
	isOk(): this is OkRes<V>
	isErr(): this is never
}
```

A success result. Call [`OK`](#OK) rather than `new` [`OkRes`](#OkRes).

### Accepts

`constructor(value)`. The payload.

### Returns

An instance with `ok === true`, `value` set to that payload, and `error` left `undefined`. It is an `instanceof` [`Res`](#Res) and an `instanceof` [`OkRes`](#OkRes). `isOk()` is always true. `isErr()` is always false, which is why an [`OkRes`](#OkRes) | [`ErrRes`](#ErrRes) check narrows cleanly.


<small><a href="#contents">to contents</a></small>

<a id="ErrRes"></a>

## ErrRes

```ts
class ErrRes<E = unknown> extends Res<never, E> {
	get ok(): false
	readonly value: undefined
	readonly error: E
	constructor(error: E)
	isOk(): this is never
	isErr(): this is ErrRes<E>
}
```

A failure result. Call [`ERR`](#ERR) rather than `new` [`ErrRes`](#ErrRes).

### Accepts

`constructor(error)`. The payload.

### Returns

An instance with `ok === false`, `error` set to that payload, and `value` left `undefined`. It is an `instanceof` [`Res`](#Res) and an `instanceof` [`ErrRes`](#ErrRes). `isErr()` is always true. `isOk()` is always false.


<small><a href="#contents">to contents</a></small>

<a id="AnyRes"></a>

## AnyRes

```ts
type AnyRes = OkRes<unknown> | ErrRes<unknown>
```

An ok or error result with an unknown payload. `mutate` receives this. It is not a third kind of result.


<small><a href="#contents">to contents</a></small>

<a id="ResInit"></a>

## ResInit

```ts
type ResInit<R> = (res: R) => void
```

The signature of `init`. The second argument of [`OK`](#OK), [`ERR`](#ERR), [`RES`](#RES), [`syncRes`](#syncRes), and [`asyncRes`](#asyncRes) may be this function instead of an options object. `R` is the result that call creates.

It runs only for a result that was just created. It does not run when an existing result is returned unchanged.


<small><a href="#contents">to contents</a></small>

<a id="DefineResOptions"></a>

## DefineResOptions

```ts
interface DefineResOptions<TOk = unknown, TErr = unknown> {
	createOk?: (value: unknown) => TOk
	createErr?: (error: unknown) => TErr
	isRes?: (arg: unknown) => boolean
	isResOk?: (arg: unknown) => boolean
	getValue?: (arg: unknown) => unknown
	getError?: (arg: unknown) => unknown
}
```

The fields [`defineRes`](#defineRes) remembers. Every field is optional. `TOk` and `TErr` are the factory return types. On a stock call they default to `unknown`, and [`ResOptions`](#ResOptions) uses that default.

- `createOk` builds a new success. The default is [`OkRes`](#OkRes).
- `createErr` builds a new failure. The default is [`ErrRes`](#ErrRes).
- `isRes` tells a result from any other value. The default is `instanceof` [`Res`](#Res).
- `isResOk` tells which of those results are successes. The default reads `ok`.
- `getValue` reads the payload of an ok result when [`ERR`](#ERR) flips it.
- `getError` reads the payload of an error result when [`OK`](#OK) flips it.


<small><a href="#contents">to contents</a></small>

<a id="ResOptions"></a>

## ResOptions

```ts
type ResOptions<R = AnyRes> = DefineResOptions & {
	init?: ResInit<R>
	mutate?: (res: AnyRes) => void
	convertToRes?: (arg: unknown, options: ResOptions) => unknown
}
```

The options object for one call of [`OK`](#OK), [`ERR`](#ERR), or [`RES`](#RES). It is [`DefineResOptions`](#DefineResOptions) plus three callbacks. [`defineRes`](#defineRes) does not store them.

**init** receives the result that was just created. It does not run when the same reference is returned.

**mutate** receives the existing result when that same reference is returned. It does not run for a result that was just created.

A call runs **init** or **mutate**, not both.

**convertToRes** runs only after `isRes` has accepted the value and the kind already matches. Return that same object and **mutate** runs. Return a different object and **init** runs on it. A missing hook, or a value that is not a function, leaves the result as it is. There is no built-in function.


<small><a href="#contents">to contents</a></small>

<a id="ResArg"></a>

## ResArg

```ts
type ResArg<R> = ResOptions<R> | ResInit<R>
```

The second argument of [`OK`](#OK), [`ERR`](#ERR), and [`RES`](#RES). Pass a [`ResOptions`](#ResOptions) object, or pass [`ResInit`](#ResInit) directly. Both describe the same `init`.


<small><a href="#contents">to contents</a></small>

<a id="InvokeFields"></a>

## InvokeFields

```ts
interface InvokeFields<A extends readonly unknown[] = readonly unknown[]> {
	shouldInvoke?: (fn: (...args: A) => unknown) => boolean
	invokeContext?: unknown
}
```

The call controls that do not choose the argument list. `A` is the parameter list of the function passed to [`syncRes`](#syncRes) or [`asyncRes`](#asyncRes).

`shouldInvoke` receives that function. A function that returns false skips the call, and the function itself is wrapped as ok. Any other value, including a non-function, means the call goes ahead.

`invokeContext` is `this` for the call. The property is used when the key is present, so `invokeContext: undefined` still uses `call` or `apply`. A missing key calls the function as a plain call when no argument list is set.


<small><a href="#contents">to contents</a></small>

<a id="InvokeOptions"></a>

## InvokeOptions

```ts
type InvokeOptions<A extends readonly unknown[] = readonly unknown[], R = AnyRes> =
	ResOptions<R> &
	InvokeFields<A> &
	(
		| { invokeArgs: A; invokeArg?: never }
		| { invokeArg: A[number]; invokeArgs?: never }
		| { invokeArgs?: never; invokeArg?: never }
	)
```

The options object for one call of [`syncRes`](#syncRes) or [`asyncRes`](#asyncRes). It is [`ResOptions`](#ResOptions) and [`InvokeFields`](#InvokeFields), plus the argument list.

`invokeArgs` is the list passed with `apply`. It must be an array, and the type requires it to match `A`. `invokeArg` is one argument passed with `call`. The key counts even when the value is `undefined`: that is one argument, not "no arguments". Setting both is a type error. At runtime it becomes an error result rather than a throw out of the boundary. Leaving both out calls the function with no arguments.


<small><a href="#contents">to contents</a></small>

<a id="InvokeArg"></a>

## InvokeArg

```ts
type InvokeArg<R, A extends readonly unknown[] = readonly unknown[]> =
	| InvokeOptions<A, R>
	| ResInit<R>
```

The second argument of [`syncRes`](#syncRes) and [`asyncRes`](#asyncRes) when the first argument is a function. Pass an [`InvokeOptions`](#InvokeOptions) object, or pass [`ResInit`](#ResInit) directly.

When the first argument is not a function, the second argument is a [`ResArg`](#ResArg). Invoke fields are ignored in that case.


<small><a href="#contents">to contents</a></small>

<a id="DefinedRes"></a>

## DefinedRes

```ts
interface DefinedRes {
	OK: typeof OK
	ERR: typeof ERR
	RES: typeof RES
	syncRes: typeof syncRes
	asyncRes: typeof asyncRes
}
```

What [`defineRes`](#defineRes) returns when you pass no factories, or none that replace [`OkRes`](#OkRes) and [`ErrRes`](#ErrRes). The five functions keep the stock signatures, including `KeptOk` and the [`ErrRes<unknown>`](#ErrRes) arm of [`syncRes`](#syncRes).


<small><a href="#contents">to contents</a></small>

<a id="CustomDefinedRes"></a>

## CustomDefinedRes

```ts
interface CustomDefinedRes<TOk, TErr> {
	OK: (value: unknown, options?: ResArg<TOk>) => TOk
	ERR: (error: unknown, options?: ResArg<TErr>) => TErr
	RES: (value: unknown, options?: ResArg<TOk | TErr>) => TOk | TErr
	syncRes: (value: unknown, options?: InvokeArg<TOk | TErr>) => TOk | TErr
	asyncRes: (value: unknown, options?: InvokeArg<TOk | TErr>) => Promise<TOk | TErr>
}
```

What [`defineRes`](#defineRes) returns when `createOk`, `createErr`, or both replace the stock classes. `TOk` and `TErr` are those factory return types. A factory you did not pass stays [`OkRes<unknown>`](#OkRes) or [`ErrRes<unknown>`](#ErrRes).

The wrappers take `unknown` as the payload. They do not repeat the stock `KeptOk` / `KeptErr` tracking. [`syncRes`](#syncRes) on these wrappers is `TOk | TErr` for a function and for a plain value. The stock split, where a plain value has no error arm, stays on the stock [`syncRes`](#syncRes).

<small><a href="#contents">to contents</a></small>
