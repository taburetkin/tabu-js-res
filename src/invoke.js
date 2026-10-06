import { RES, ERR } from './res.js'




function invoke(fn, options) {
	if (typeof fn !== 'function') return fn;
	if (typeof options === 'function') options = { init: options }
	if (!options || typeof options !== 'object') return fn();

	const { shouldInvoke, invokeContext, invokeArgs, invokeArg } = options;
	if (typeof shouldInvoke === 'function' && !shouldInvoke(fn)) return fn;

	const hasArgs = options.invokeArgs != null;
	const hasArg = 'invokeArg' in options;
	if (hasArgs && hasArg)
		throw new Error('invokeArgs and invokeArg can not be defined at the same time');

	if (hasArgs && !Array.isArray(invokeArgs))
		throw new Error('invokeArgs must be an array');

	const hasContext = 'invokeContext' in options;


	if (hasArgs) return fn.apply(invokeContext, invokeArgs);
	if (hasArg) return fn.call(invokeContext, invokeArg);
	if (hasContext) return fn.call(invokeContext);
	return fn();

}



export function syncRes(fn, options) {
	try {
		const value = invoke(fn, options);
		return RES(value, options)
	} catch (exc) {
		return ERR(exc, options);
	}
}

export async function asyncRes(arg, options) {
	try {
		const invoked = invoke(arg, options);
		const awaited = await invoked;
		return RES(awaited, options);
	} catch (exc) {
		return ERR(exc, options);
	}
}
