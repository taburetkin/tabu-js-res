import type { ERR, ErrRes, OK, OkRes, RES, ResArg } from './res.js';
import type { InvokeArg, asyncRes, syncRes } from './invoke.js';

export interface DefinedRes {
	OK: typeof OK;
	ERR: typeof ERR;
	RES: typeof RES;
	syncRes: typeof syncRes;
	asyncRes: typeof asyncRes;
}

export interface CustomDefinedRes<TOk, TErr> {
	OK: (value: unknown, options?: ResArg<TOk>) => TOk;
	ERR: (error: unknown, options?: ResArg<TErr>) => TErr;
	RES: (value: unknown, options?: ResArg<TOk | TErr>) => TOk | TErr;
	syncRes: (value: unknown, options?: InvokeArg<TOk | TErr>) => TOk | TErr;
	asyncRes: (value: unknown, options?: InvokeArg<TOk | TErr>) => Promise<TOk | TErr>;
}

export interface DefineResOptions<TOk = unknown, TErr = unknown> {
	createOk?: (value: unknown) => TOk;
	createErr?: (error: unknown) => TErr;
	isRes?: (arg: unknown) => boolean;
	isResOk?: (arg: unknown) => boolean;
	getValue?: (arg: unknown) => unknown;
	getError?: (arg: unknown) => unknown;
}

export function defineRes<TOk, TErr>(
	options: DefineResOptions<TOk, TErr> & {
		createOk: (value: unknown) => TOk;
		createErr: (error: unknown) => TErr;
	},
): CustomDefinedRes<TOk, TErr>;

export function defineRes<TOk>(
	options: DefineResOptions<TOk, ErrRes<unknown>> & {
		createOk: (value: unknown) => TOk;
		createErr?: undefined;
	},
): CustomDefinedRes<TOk, ErrRes<unknown>>;

export function defineRes<TErr>(
	options: DefineResOptions<OkRes<unknown>, TErr> & {
		createOk?: undefined;
		createErr: (error: unknown) => TErr;
	},
): CustomDefinedRes<OkRes<unknown>, TErr>;

export function defineRes(options?: DefineResOptions): DefinedRes;
