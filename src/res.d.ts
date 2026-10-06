export class Res<V = unknown, E = unknown> {
	readonly value: V | undefined;
	readonly error: E | undefined;
	get ok(): boolean;
	constructor(ok: boolean, arg: V | E);
	isOk(): this is OkRes<V>;
	isErr(): this is ErrRes<E>;
}

export class OkRes<V = unknown> extends Res<V, never> {
	get ok(): true;
	readonly value: V;
	readonly error: undefined;
	constructor(value: V);
	isOk(): this is OkRes<V>;
	isErr(): this is never;
}

export class ErrRes<E = unknown> extends Res<never, E> {
	get ok(): false;
	readonly value: undefined;
	readonly error: E;
	constructor(error: E);
	isOk(): this is never;
	isErr(): this is ErrRes<E>;
}

import type { DefineResOptions } from './defineRes.js';

export type AnyRes = OkRes<unknown> | ErrRes<unknown>;

export type ResInit<R> = (res: R) => void;

export type ResOptions<R = AnyRes> = DefineResOptions & {
	init?: ResInit<R>;
	mutate?: (res: AnyRes) => void;
	convertToRes?: (arg: unknown, options: ResOptions) => unknown;
};

export type ResArg<R> = ResOptions<R> | ResInit<R>;

type KeptOk<T> =
	T extends ErrRes<infer E> ? OkRes<E> :
	T extends OkRes<infer V> ? OkRes<V> :
	T extends Res<infer V, infer E> ? T | OkRes<E> :
	OkRes<T>;

type KeptErr<T> =
	T extends OkRes<infer V> ? ErrRes<V> :
	T extends ErrRes<infer E> ? ErrRes<E> :
	T extends Res<infer V, infer E> ? T | ErrRes<V> :
	ErrRes<T>;

type KeptRes<T> = T extends Res<unknown, unknown> ? T : OkRes<T>;

export function OK<T>(value: T, options?: ResArg<KeptOk<T>>): KeptOk<T>;

export function ERR<T>(error: T, options?: ResArg<KeptErr<T>>): KeptErr<T>;

export function RES<T>(value: T, options?: ResArg<KeptRes<T>>): KeptRes<T>;
