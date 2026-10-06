import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as root from 'tabu-js-res';
import * as defineEntry from 'tabu-js-res/define-res';
import * as invokeEntry from 'tabu-js-res/invoke';
import * as resEntry from 'tabu-js-res/res';
import { defineRes } from '../src/defineRes.js';
import { asyncRes, syncRes } from '../src/invoke.js';
import { ERR, OK, RES, ErrRes, OkRes, Res } from '../src/res.js';

describe('package exports', () => {
	it('re-exports the same runtime values from the root and the subpaths', () => {
		assert.equal(root.Res, Res);
		assert.equal(root.OkRes, OkRes);
		assert.equal(root.ErrRes, ErrRes);
		assert.equal(root.OK, OK);
		assert.equal(root.ERR, ERR);
		assert.equal(root.RES, RES);
		assert.equal(root.syncRes, syncRes);
		assert.equal(root.asyncRes, asyncRes);
		assert.equal(root.defineRes, defineRes);

		assert.equal(resEntry.Res, Res);
		assert.equal(resEntry.OkRes, OkRes);
		assert.equal(resEntry.ErrRes, ErrRes);
		assert.equal(resEntry.OK, OK);
		assert.equal(resEntry.ERR, ERR);
		assert.equal(resEntry.RES, RES);

		assert.equal(invokeEntry.syncRes, syncRes);
		assert.equal(invokeEntry.asyncRes, asyncRes);

		assert.equal(defineEntry.defineRes, defineRes);
	});
});
