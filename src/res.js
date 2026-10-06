export class Res {
	#ok;
	error;
	value;

	constructor(ok, arg) {
		const isOk = ok === true;
		this.#ok = isOk;
		if (isOk) {
			this.value = arg;
		} else {
			this.error = arg;
		}
	}

	get ok() { return this.#ok === true; }
	isOk() { return this.ok; }
	isErr() { return !this.ok; }
}

export class ErrRes extends Res {
	constructor(err) {
		super(false, err)
	}
}
export class OkRes extends Res {
	constructor(value) {
		super(true, value)
	}
}

const defCreateOk = arg => new OkRes(arg);
const defCreateErr = arg => new ErrRes(arg);
const defIsRes = arg => arg instanceof Res;
const defIsResOk = arg => arg.ok;
const defGetValue = arg => arg.value;
const defGetError = arg => arg.error;

function create(ok, arg, options) {
	
	const createOk = options?.createOk ?? defCreateOk;
	const createErr = options?.createErr ?? defCreateErr;

	const res = ok ? createOk(arg) : createErr(arg);

	const cb = typeof options?.init === 'function' ? options.init : undefined;

	if (cb) cb(res);

	return res;
}

function convert(isOk, arg, options) {
	if (typeof options === 'function') {
		options = { init: options }
	}
	const isRes = options?.isRes ?? defIsRes;
	const isResOk = options?.isResOk ?? defIsResOk;
	const getValue = options?.getValue ?? defGetValue;
	const getError = options?.getError ?? defGetError;
	const normIsOk = isOk !== false;

	if (isRes(arg)) {
		if (isOk == null || isResOk(arg) === normIsOk) {
			if (typeof options?.mutate === 'function') {
				options.mutate(arg);
			}
			return arg;
		}
		arg = isResOk(arg) ? getValue(arg) : getError(arg);
	}
	return create(normIsOk, arg, options)
}

export function OK(arg, options) {
	return convert(true, arg, options);
}

export function ERR(arg, options) {
	return convert(false, arg, options);
}

export function RES(arg, options) {
	return convert(undefined, arg, options);
}