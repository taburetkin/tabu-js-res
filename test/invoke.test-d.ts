import { expectType } from 'tsd';
import { ERR, OK, ErrRes, OkRes, asyncRes, syncRes } from 'tabu-js-res';

expectType<OkRes<number> | ErrRes<unknown>>(syncRes(() => 1));
expectType<OkRes<number>>(syncRes(1));
expectType<OkRes<number>>(syncRes(OK(1)));

declare function takes(a: string, b: number): number;
expectType<OkRes<number> | ErrRes<unknown>>(syncRes(takes, { invokeArgs: ['a', 1] }));

declare function takesOptional(value: string | undefined): number;
expectType<OkRes<number> | ErrRes<unknown>>(
	syncRes(takesOptional, { invokeArg: undefined }),
);

// @ts-expect-error invokeArgs and invokeArg cannot be set together
syncRes(takes, { invokeArgs: ['a', 1], invokeArg: 'a' });

expectType<Promise<OkRes<number> | ErrRes<unknown>>>(asyncRes(async () => 1));
expectType<Promise<OkRes<number> | ErrRes<unknown>>>(asyncRes(() => 1));
expectType<Promise<OkRes<number> | ErrRes<unknown>>>(asyncRes(Promise.resolve(1)));
expectType<Promise<OkRes<number> | ErrRes<unknown>>>(asyncRes(1));
expectType<Promise<ErrRes<string> | ErrRes<unknown>>>(asyncRes(ERR('e')));
