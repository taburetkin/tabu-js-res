import { expectType } from 'tsd';
import { ERR, OK, RES, ErrRes, OkRes, Res } from 'tabu-js-res';

OK(1, {
	convertToRes(arg) { return arg; },
});

expectType<OkRes<number>>(OK(1));
expectType<OkRes<number>>(OK(OK(1)));
expectType<OkRes<string>>(OK(ERR('e')));

expectType<ErrRes<string>>(ERR('e'));
expectType<ErrRes<string>>(ERR(ERR('e')));
expectType<ErrRes<number>>(ERR(OK(1)));

expectType<OkRes<number>>(RES(1));
expectType<OkRes<number>>(RES(OK(1)));
expectType<ErrRes<string>>(RES(ERR('e')));

declare const plain: Res<string, number>;
expectType<Res<string, number> | OkRes<number>>(OK(plain));
expectType<Res<string, number> | ErrRes<string>>(ERR(plain));
expectType<Res<string, number>>(RES(plain));

declare const mixed: OkRes<number> | ErrRes<string>;
expectType<OkRes<number> | OkRes<string>>(OK(mixed));
expectType<ErrRes<number> | ErrRes<string>>(ERR(mixed));
expectType<OkRes<number> | ErrRes<string>>(RES(mixed));

if (mixed.isOk()) {
	expectType<OkRes<number>>(mixed);
	expectType<number>(mixed.value);
} else {
	expectType<ErrRes<string>>(mixed);
	expectType<string>(mixed.error);
}

if (mixed.isErr()) {
	expectType<ErrRes<string>>(mixed);
} else {
	expectType<OkRes<number>>(mixed);
}
