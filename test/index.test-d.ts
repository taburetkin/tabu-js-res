import { expectType } from 'tsd';
import { OK, defineRes, syncRes, type DefinedRes } from 'tabu-js-res';
import { defineRes as defineFromPath } from 'tabu-js-res/define-res';
import { syncRes as syncFromInvoke } from 'tabu-js-res/invoke';
import { OK as okFromRes } from 'tabu-js-res/res';

expectType<typeof OK>(okFromRes);
expectType<typeof syncRes>(syncFromInvoke);
expectType<typeof defineRes>(defineFromPath);
expectType<DefinedRes>(defineRes());
