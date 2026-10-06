import type { ErrRes, OkRes, Res, ResArg, ResHooks, ResInit } from './res.js';

type KeptRes<T> = T extends Res<unknown, unknown> ? T : OkRes<T>;

export interface InvokeFields<A extends readonly unknown[] = readonly unknown[]> {
	shouldInvoke?: (fn: (...args: A) => unknown) => boolean;
	invokeContext?: unknown;
}

export type InvokeOptions<A extends readonly unknown[] = readonly unknown[]> =
	ResHooks &
	InvokeFields<A> &
	(
		| { invokeArgs: A; invokeArg?: never }
		| { invokeArg: A[number]; invokeArgs?: never }
		| { invokeArgs?: never; invokeArg?: never }
	);

export type InvokeArg<R, A extends readonly unknown[] = readonly unknown[]> =
	| (InvokeOptions<A> & { init?: ResInit<R> })
	| ResInit<R>;

type SyncResult<T> = KeptRes<T> | ErrRes<unknown>;
type AsyncResult<T> = KeptRes<Awaited<T>> | ErrRes<unknown>;

export function syncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => T,
	options?: InvokeArg<SyncResult<T>, A>,
): SyncResult<T>;

export function syncRes<T>(
	value: T,
	options?: ResArg<KeptRes<T>>,
): KeptRes<T>;

export function asyncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => PromiseLike<T>,
	options?: InvokeArg<KeptRes<T> | ErrRes<unknown>, A>,
): Promise<KeptRes<T> | ErrRes<unknown>>;

export function asyncRes<A extends readonly unknown[], T>(
	fn: (...args: A) => T,
	options?: InvokeArg<AsyncResult<T>, A>,
): Promise<AsyncResult<T>>;

export function asyncRes<T>(
	value: T,
	options?: ResArg<AsyncResult<T>>,
): Promise<AsyncResult<T>>;
