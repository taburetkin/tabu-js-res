import { expectType } from 'tsd';
import { defineRes, OK, ErrRes, OkRes, type DefinedRes } from 'tabu-js-res';

expectType<DefinedRes>(defineRes());
expectType<typeof OK>(defineRes().OK);
expectType<DefinedRes>(defineRes({}));

// @ts-expect-error mutate is not mixed in by defineRes
defineRes({ mutate() {} });

// @ts-expect-error init is not mixed in by defineRes
defineRes({ init() {} });

// @ts-expect-error convertToRes is not mixed in by defineRes
defineRes({ convertToRes() {} });

const both = defineRes({
	createOk: (value: unknown) => ({ ok: true as const, value }),
	createErr: (error: unknown) => ({ ok: false as const, error }),
});
expectType<{ ok: true; value: unknown }>(both.OK(1));
expectType<{ ok: false; error: unknown }>(both.ERR('e'));
expectType<{ ok: true; value: unknown } | { ok: false; error: unknown }>(both.RES(1));
expectType<{ ok: true; value: unknown } | { ok: false; error: unknown }>(
	both.syncRes((n: number) => n + 1, { invokeArg: 1 }),
);
expectType<Promise<{ ok: true; value: unknown } | { ok: false; error: unknown }>>(
	both.asyncRes(async () => 1),
);

const okOnly = defineRes({
	createOk: (value: unknown) => ({ tag: 'ok' as const, value }),
});
expectType<{ tag: 'ok'; value: unknown }>(okOnly.OK(1));
expectType<ErrRes<unknown>>(okOnly.ERR('e'));

const errOnly = defineRes({
	createErr: (error: unknown) => ({ tag: 'err' as const, error }),
});
expectType<OkRes<unknown>>(errOnly.OK(1));
expectType<{ tag: 'err'; error: unknown }>(errOnly.ERR('e'));
