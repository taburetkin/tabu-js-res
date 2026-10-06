
import { OK, ERR, RES } from './res.js';
import { syncRes, asyncRes } from './invoke.js';

function mix(def, opts) {
	if (typeof opts === 'function') {
		opts = { init: opts }
	}
	return Object.assign({}, def, opts);
}

export function defineRes({
	createOk,
	createErr,
	isRes,
	isResOk,
	getValue,
	getError,
} = {}) {

	const def = {
		createOk,
		createErr,
		isRes,
		isResOk,
		getValue,
		getError,
	}

	const api = {
		OK: (arg, options) => OK(arg, mix(def, options)),
		ERR: (arg, options) => ERR(arg, mix(def, options)),
		RES: (arg, options) => RES(arg, mix(def, options)),
		syncRes: (arg, options) => syncRes(arg, mix(def, options)),
		asyncRes: (arg, options) => asyncRes(arg, mix(def, options))
	}

	return api;

}
