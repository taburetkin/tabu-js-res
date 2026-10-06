import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ERR, OK, RES, ErrRes, OkRes, Res } from '../src/res.js';
import { assertErr, assertOk } from './assertResult.js';

const customHooks = {
	createOk(value) { return { kind: 'ok', value }; },
	createErr(error) { return { kind: 'err', error }; },
	isRes(arg) { return arg != null && (arg.kind === 'ok' || arg.kind === 'err'); },
	isResOk(arg) { return arg.kind === 'ok'; },
	getValue(arg) { return arg.value; },
	getError(arg) { return arg.error; },
};

describe('Res', () => {
	it('stores the value when the flag is true', () => {
		const res = new Res(true, 'v');
		assert.equal(res.ok, true);
		assert.equal(res.isOk(), true);
		assert.equal(res.isErr(), false);
		assert.equal(res.value, 'v');
		assert.equal(res.error, undefined);
		assert.ok(res instanceof Res);
		assert.equal(res instanceof OkRes, false);
	});

	it('stores the error when the flag is false or any other value', () => {
		const res = new Res(false, 'e');
		assert.equal(res.ok, false);
		assert.equal(res.isOk(), false);
		assert.equal(res.isErr(), true);
		assert.equal(res.error, 'e');
		assert.equal(res.value, undefined);

		const truthy = new Res(1, 'x');
		assert.equal(truthy.ok, false);
		assert.equal(truthy.isErr(), true);
		assert.equal(truthy.error, 'x');
		assert.equal(truthy.value, undefined);
	});
});

describe('OkRes and ErrRes', () => {
	it('sets the success and failure flags', () => {
		const ok = new OkRes('v');
		assert.ok(ok instanceof Res);
		assert.ok(ok instanceof OkRes);
		assert.equal(ok instanceof ErrRes, false);
		assert.equal(ok.ok, true);
		assert.equal(ok.isOk(), true);
		assert.equal(ok.value, 'v');
		assert.equal(ok.error, undefined);

		const err = new ErrRes('e');
		assert.ok(err instanceof Res);
		assert.ok(err instanceof ErrRes);
		assert.equal(err instanceof OkRes, false);
		assert.equal(err.ok, false);
		assert.equal(err.isErr(), true);
		assert.equal(err.error, 'e');
		assert.equal(err.value, undefined);
	});
});

describe('OK', () => {
	it('wraps a plain value and accepts init as a function', () => {
		let seen;
		const result = OK(1, (res) => { seen = res; });
		assertOk(result, 1);
		assert.equal(seen, result);
	});

	it('ignores an init that is not a function', () => {
		assertOk(OK(1, { init: 1 }), 1);
		assertOk(OK(1, null), 1);
	});

	it('returns the same Ok and mutates it instead of creating another', () => {
		const ok = OK(1);
		let created = false;
		let mutated;
		let inited = false;
		const result = OK(ok, {
			createOk() { created = true; },
			mutate(res) { mutated = res; },
			init() { inited = true; },
		});
		assert.equal(result, ok);
		assert.equal(created, false);
		assert.equal(mutated, ok);
		assert.equal(inited, false);
	});

	it('does not mutate a result it has just created', () => {
		let mutated = false;
		OK(1, { mutate() { mutated = true; } });
		assert.equal(mutated, false);
	});

	it('unwraps an Err into a new Ok and runs init', () => {
		const err = ERR('e');
		let seen;
		const result = OK(err, (res) => { seen = res; });
		assertOk(result, 'e');
		assert.notEqual(result, err);
		assert.equal(seen, result);
	});
});

describe('ERR', () => {
	it('wraps a plain error and accepts init as a function', () => {
		let seen;
		const result = ERR('e', (res) => { seen = res; });
		assertErr(result, 'e');
		assert.equal(seen, result);
	});

	it('returns the same Err and mutates it', () => {
		const err = ERR('e');
		let mutated;
		let inited = false;
		const result = ERR(err, {
			mutate(res) { mutated = res; },
			init() { inited = true; },
		});
		assert.equal(result, err);
		assert.equal(mutated, err);
		assert.equal(inited, false);
	});

	it('unwraps an Ok into a new Err', () => {
		const ok = OK(1);
		const result = ERR(ok);
		assertErr(result, 1);
		assert.notEqual(result, ok);
	});
});

describe('RES', () => {
	it('wraps a plain value as Ok and runs init', () => {
		let seen;
		const result = RES(1, (res) => { seen = res; });
		assertOk(result, 1);
		assert.equal(seen, result);
	});

	it('keeps both Ok and Err, mutating them and skipping init', () => {
		const ok = OK(1);
		const err = ERR('e');
		let inited = false;
		let mutated = 0;
		const options = {
			mutate() { mutated += 1; },
			init() { inited = true; },
		};
		assert.equal(RES(ok, options), ok);
		assert.equal(RES(err, options), err);
		assert.equal(mutated, 2);
		assert.equal(inited, false);
	});

	it('wraps an existing Ok when isRes rejects it', () => {
		const ok = OK(1);
		const wrapped = RES(ok, { isRes: () => false });
		assert.notEqual(wrapped, ok);
		assertOk(wrapped, ok);
	});
});

describe('convertToRes', () => {
	it('mutates the same object when the hook returns it', () => {
		const ok = OK(1);
		let mutated;
		let inited = false;
		const result = OK(ok, {
			convertToRes(arg) { return arg; },
			mutate(res) { mutated = res; },
			init() { inited = true; },
		});
		assert.equal(result, ok);
		assert.equal(mutated, ok);
		assert.equal(inited, false);
	});

	it('inits a replacement and does not mutate the original', () => {
		const ok = OK(1);
		const next = new OkRes(2);
		let mutated = false;
		let inited;
		const result = OK(ok, {
			convertToRes() { return next; },
			mutate() { mutated = true; },
			init(res) { inited = res; },
		});
		assert.equal(result, next);
		assert.equal(mutated, false);
		assert.equal(inited, next);
	});

	it('ignores a convertToRes that is not a function', () => {
		const ok = OK(1);
		assert.equal(OK(ok, { convertToRes: 1 }), ok);
	});

	it('does not call the hook when the kind flips', () => {
		const err = ERR('e');
		const ok = OK(1);
		let called = false;
		const hook = () => { called = true; };
		assertOk(OK(err, { convertToRes: hook }), 'e');
		assert.equal(called, false);
		assertErr(ERR(ok, { convertToRes: hook }), 1);
		assert.equal(called, false);
	});

	it('runs the hook for both kinds of RES and for an error that stays an error', () => {
		const ok = OK(1);
		const err = ERR('e');
		const nextOk = new OkRes(2);
		const nextErr = new ErrRes('x');
		assert.equal(RES(ok, { convertToRes() { return nextOk; } }), nextOk);
		assert.equal(RES(err, { convertToRes() { return nextErr; } }), nextErr);
		assert.equal(ERR(err, { convertToRes() { return nextErr; } }), nextErr);
	});
});

describe('custom hooks', () => {
	it('uses the supplied factories and recognizers', () => {
		const createdOk = OK('v', customHooks);
		const createdErr = ERR('e', customHooks);
		assert.deepEqual(createdOk, { kind: 'ok', value: 'v' });
		assert.deepEqual(createdErr, { kind: 'err', error: 'e' });
		assert.equal(OK(createdOk, customHooks), createdOk);
		assert.equal(ERR(createdErr, customHooks), createdErr);
		assert.deepEqual(OK(createdErr, customHooks), { kind: 'ok', value: 'e' });
		assert.deepEqual(ERR(createdOk, customHooks), { kind: 'err', error: 'v' });
		assert.equal(RES(createdErr, customHooks), createdErr);
		assert.deepEqual(RES('plain', customHooks), { kind: 'ok', value: 'plain' });
	});
});
