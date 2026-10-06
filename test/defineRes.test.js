import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { defineRes } from '../src/defineRes.js';
import { ERR, OK, OkRes, ErrRes } from '../src/res.js';
import { assertErr, assertOk } from './assertResult.js';

function customOk(value) {
	return { kind: 'ok', value };
}

function customErr(error) {
	return { kind: 'err', error };
}

describe('defineRes', () => {
	it('uses stock results when no hooks are passed', () => {
		const api = defineRes();
		assertOk(api.OK(1), 1);
		assertErr(api.ERR('e'), 'e');
		const stockErr = ERR('kept');
		assert.equal(api.RES(stockErr), stockErr);
	});

	it('merges definition hooks into every call', () => {
		const api = defineRes({ createOk: customOk, createErr: customErr });
		assert.deepEqual(api.OK('v'), { kind: 'ok', value: 'v' });
		assert.deepEqual(api.ERR('e'), { kind: 'err', error: 'e' });
		assert.deepEqual(api.RES('v'), { kind: 'ok', value: 'v' });
		const stockErr = ERR('kept');
		assert.equal(api.RES(stockErr), stockErr);
	});

	it('lets a per-call hook override the definition and treats undefined as the default factory', () => {
		const api = defineRes({ createOk: customOk, createErr: customErr });
		assert.deepEqual(api.OK(1, { createOk: () => ({ from: 'call' }) }), { from: 'call' });
		const fallbackOk = api.OK(1, { createOk: undefined });
		assert.ok(fallbackOk instanceof OkRes);
		assert.equal(fallbackOk.value, 1);
		const fallbackErr = api.ERR('e', { createErr: undefined });
		assert.ok(fallbackErr instanceof ErrRes);
		assert.equal(fallbackErr.error, 'e');
	});

	it('keeps definition hooks when the second argument is an init function', () => {
		let seen;
		const api = defineRes({ createOk: customOk });
		const res = api.OK(1, (result) => { seen = result; });
		assert.deepEqual(res, { kind: 'ok', value: 1 });
		assert.equal(seen, res);
	});

	it('does not keep mutate from the definition and still runs mutate on a call', () => {
		const ok = OK(1);
		let fromDefinition = false;
		let fromCall = false;
		const api = defineRes({
			mutate() { fromDefinition = true; },
		});
		assert.equal(api.OK(ok), ok);
		assert.equal(fromDefinition, false);
		api.OK(ok, {
			mutate() { fromCall = true; },
		});
		assert.equal(fromCall, true);
	});

	it('passes hooks and invokeArg through syncRes and asyncRes', async () => {
		const api = defineRes({ createOk: customOk, createErr: customErr });
		assert.deepEqual(
			api.syncRes((n) => n + 1, { invokeArg: 1 }),
			{ kind: 'ok', value: 2 },
		);
		assert.deepEqual(
			await api.asyncRes(async (n) => n + 1, { invokeArg: 1 }),
			{ kind: 'ok', value: 2 },
		);
		const error = new Error('x');
		const failed = api.syncRes(() => { throw error; });
		assert.equal(failed.kind, 'err');
		assert.equal(failed.error, error);
	});
});
