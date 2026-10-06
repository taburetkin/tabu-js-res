import assert from 'node:assert/strict';
import { ErrRes, OkRes } from '../src/res.js';

export function assertOk(res, value) {
	assert.equal(res.ok, true);
	assert.equal(res.isOk(), true);
	assert.equal(res.isErr(), false);
	assert.ok(res instanceof OkRes);
	assert.equal(res.value, value);
	assert.equal(res.error, undefined);
}

export function assertErr(res, error) {
	assert.equal(res.ok, false);
	assert.equal(res.isOk(), false);
	assert.equal(res.isErr(), true);
	assert.ok(res instanceof ErrRes);
	assert.equal(res.error, error);
	assert.equal(res.value, undefined);
}
