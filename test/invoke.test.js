import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { asyncRes, syncRes } from '../src/invoke.js';
import { ERR, OK } from '../src/res.js';
import { assertErr, assertOk } from './assertResult.js';

async function eachBoundary(check) {
	await check((fn, options) => Promise.resolve(syncRes(fn, options)));
	await check((fn, options) => asyncRes(fn, options));
}

describe('syncRes and asyncRes', () => {
	it('wraps a non-function and ignores invoke options', async () => {
		await eachBoundary(async (call) => {
			const res = await call(5, { invokeArgs: [1], invokeContext: {} });
			assertOk(res, 5);
		});
	});

	it('wraps a successful return value', async () => {
		await eachBoundary(async (call) => {
			assertOk(await call(() => 1), 1);
		});
	});

	it('turns a throw into Err and does not rethrow', async () => {
		const error = new Error('x');
		await eachBoundary(async (call) => {
			assertErr(await call(() => { throw error; }), error);
		});
	});

	it('keeps a returned result and skips init', async () => {
		const existing = OK(1);
		await eachBoundary(async (call) => {
			let called = false;
			const res = await call(() => existing, () => { called = true; });
			assert.equal(res, existing);
			assert.equal(called, false);
		});
	});

	it('runs init for a newly created result when options are a function', async () => {
		await eachBoundary(async (call) => {
			let seen;
			const res = await call(() => 6, (result) => { seen = result; });
			assertOk(res, 6);
			assert.equal(seen, res);
		});
	});

	it('turns a throwing init on success into Err and calls init again', async () => {
		await eachBoundary(async (call) => {
			const seen = [];
			let boom;
			const res = await call(() => 1, {
				init(result) {
					seen.push(result.ok);
					if (result.ok) {
						boom = new Error('boom');
						throw boom;
					}
				},
			});
			assert.deepEqual(seen, [true, false]);
			assertErr(res, boom);
		});
	});

	it('returns the function itself when shouldInvoke is false', async () => {
		function fn() { throw new Error('called'); }
		await eachBoundary(async (call) => {
			let seen;
			const res = await call(fn, {
				shouldInvoke(got) {
					seen = got;
					return false;
				},
			});
			assert.equal(seen, fn);
			assertOk(res, fn);
		});
	});

	it('invokes the function when shouldInvoke is true or not a function', async () => {
		await eachBoundary(async (call) => {
			let seen = false;
			assertOk(await call(() => 3, { shouldInvoke() { seen = true; return true; } }), 3);
			assert.equal(seen, true);
			assertOk(await call(() => 4, { shouldInvoke: true }), 4);
		});
	});

	it('passes invokeArg, including undefined, and invokeContext via call', async () => {
		function fn(arg) {
			return { self: this, arg, length: arguments.length };
		}
		const ctx = { id: 'ctx' };
		await eachBoundary(async (call) => {
			const res = await call(fn, { invokeContext: ctx, invokeArg: undefined });
			assert.deepEqual(res.value, { self: ctx, arg: undefined, length: 1 });
		});
	});

	it('passes invokeArgs via apply, including an empty list and a context', async () => {
		function fn(a, b) {
			return { self: this, args: [a, b], length: arguments.length };
		}
		const ctx = { id: 'ctx' };
		await eachBoundary(async (call) => {
			const withArgs = await call(fn, { invokeContext: ctx, invokeArgs: [1, 2] });
			assert.deepEqual(withArgs.value, { self: ctx, args: [1, 2], length: 2 });
			const empty = await call(fn, { invokeArgs: [] });
			assert.equal(empty.value.length, 0);
		});
	});

	it('calls with only invokeContext and no arguments', async () => {
		function fn() {
			return { self: this, length: arguments.length };
		}
		const ctx = { id: 'ctx' };
		await eachBoundary(async (call) => {
			const res = await call(fn, { invokeContext: ctx });
			assert.deepEqual(res.value, { self: ctx, length: 0 });
		});
	});

	it('returns Err when invokeArgs and invokeArg are both set', async () => {
		await eachBoundary(async (call) => {
			const res = await call(() => 1, { invokeArgs: [1], invokeArg: 2 });
			assert.equal(res.ok, false);
			assert.match(res.error.message, /invokeArgs and invokeArg/);
		});
	});

	it('returns Err when invokeArgs is not an array', async () => {
		await eachBoundary(async (call) => {
			const res = await call(() => 1, { invokeArgs: 'nope' });
			assert.equal(res.ok, false);
			assert.match(res.error.message, /invokeArgs must be an array/);
		});
	});

	it('invokes when options are missing, null, or not an object', async () => {
		await eachBoundary(async (call) => {
			assertOk(await call(() => 8, null), 8);
			assertOk(await call(() => 9, 1), 9);
		});
	});
});

describe('asyncRes', () => {
	it('unwraps a resolved promise and a thenable', async () => {
		assertOk(await asyncRes(Promise.resolve(4)), 4);
		const thenable = { then(resolve) { resolve(7); } };
		assertOk(await asyncRes(thenable), 7);
	});

	it('turns rejection into Err', async () => {
		const error = new Error('no');
		assertErr(await asyncRes(Promise.reject(error)), error);
		assertErr(await asyncRes(async () => { throw error; }), error);
		assertErr(await asyncRes(() => Promise.reject(error)), error);
	});

	it('keeps a result produced by an async function and skips init', async () => {
		const ok = OK(1);
		const err = ERR('e');
		let called = false;
		assert.equal(await asyncRes(async () => ok, () => { called = true; }), ok);
		assert.equal(called, false);
		assert.equal(await asyncRes(Promise.resolve(err)), err);
	});
});
