/* Disclaimer: 
    The majority of the functions found in this file are taken directly from 
    other sources. These are just a bag of tricks that I find generally useful.
*/

import { Left, Right } from "./data-types/Either";

export const curry = fn =>
	function currify(...args) {
		return args.length >= fn.length
			? fn.apply(null, args)
			: currify.bind(null, ...args);
	};

export const pipe = (...fns) => initialValue =>
	fns.reduce((acc, fn) => fn(acc), initialValue);

// This utility (and its counterpart, composePromises), make it so that you can compose functions that can accept either promises
// or non-promise values as inputs without having to be promise-aware. Instead of writing conditional logic to handle
// various inputs (promises vs. other data-types) and then conditionally returning a promise, or defaulting to doing the
// ceremony of `Promise.resolve(arg).then(// function logic)` inside of all the functions in your pipeline -- which unnecessarily
// complicates your code -- you could instead put your regular, promise-agnostic functions in the pipeline
// and they'll compose hassle-free. Because this utility returns a promise as its final value, you could also chain a
// `.catch()` or a `.finally()` onto the end of it (like so: `pipePromises(fn1, fn2, fn3).catch(fn4)` ).
export const pipePromises = (...fns) => initialValue =>
	fns.reduce((acc, fn) => Promise.resolve(acc).then(fn), initialValue);

export const compose = (...fns) => initialValue =>
	fns.reduceRight((acc, fn) => fn(acc), initialValue);

// This function is useful for composing promise-agnostic functions with inputs that could potentially contain a promise.
// (See `pipePromises` for a more detailed explanation.)
export const composePromises = (...fns) => initialValue =>
	fns.reduceRight((acc, fn) => Promise.resolve(acc).then(fn), initialValue);

export const prop = curry((field, o) => o[field]);

export const head = iterable => iterable[0];

export const tail = iterable => iterable.slice(1);

export const map = curry((fn, arr) => {
	function _map(mapped, arr) {
		if (arr.length === 0) {
			return mapped;
		}
		return _map([...mapped, compose(fn, head)(arr)], tail(arr));
	}
	return _map([], arr);
});

export const fmap = curry((fn, value) => value.map(fn));

export const filter = curry((fn, value) => value.filter(fn));

export const reduce = curry((reducerFn, initialValue, arr) => {
	var accumulator = initialValue === undefined ? undefined : initialValue;
	for (let i = 0; i < arr.length; i++) {
		if (accumulator !== undefined)
			accumulator = reducerFn(accumulator, arr[i], i, arr);
		else accumulator = arr[i];
	}
	return accumulator;
});

export const foldr = curry((reducerFn, initialValue, arr) =>
	reduce(reducerFn, initialValue, arr.reverse())
);

export const foldl = curry((reducerFn, initialValue, arr) => {
	function _foldl(folded, arr) {
		return arr.length === 0
			? folded
			: _foldl(compose(reducerFn.bind(null, folded), head)(arr), tail(arr));
	}

	return initialValue
		? _foldl(initialValue, arr)
		: _foldl(head(arr), tail(arr));
});

export const reduceObj = curry((reducerFn, initialValue, obj) =>
	Object.entries(obj).reduce(reducerFn, initialValue)
);

export const filterObj = curry((predicateFn, obj) => {
	const newObj = {};

	Object.entries(obj)
		.filter(([key, value]) => predicateFn(key, value))
		.forEach(([key, value]) => (newObj[key] = value));

	return newObj;
});

/**
 * Return a copy of an object without a specific key (or keys)*
 * @param {(string|array)} prop
 * @param {object} obj
 * @returns {object}
 * */

export const without = curry((prop, obj) => {
	const typeErrorMessage =
		"You must supply either a string or an array of strings as the prop to filter out.";
	switch (typeof prop) {
		case "string":
			return filterObj(function predicate(key, val) {
				return key !== prop;
			}, obj);
		case "object":
			if (Array.isArray(prop)) {
				return filterObj(function predicate(key, val) {
					return !prop.includes(key);
				}, obj);
			} else {
				throw new TypeError(typeErrorMessage);
			}
		default:
			throw new TypeError(typeErrorMessage);
	}
});

export const objectFromEntries = arr =>
	Object.assign({}, ...arr.map(([k, v]) => ({ [k]: v })));

/* This function wraps around a promise value and catches its 
	 rejection value if it rejects.

 	 Usage: (Db.Users.findAll returns a promise)
		 const [err, users] = withCatch(Db.Users.findAll())
		 if (err) {
			 console.log(err)
		 } else {
			 res.status(200).json(users)
		 }
 */
export const withCatch = promise => {
	return promise.then(data => [null, data]).catch(err => [err, null]);
};

/* This function works similary to withCatch, except it accepts an 
	 error handler upfront. 

	 Usage: (Db.Users.findAll() returns a promise) 
	 	const usersOrError = catchErrors(Db.Users.findAll(), console.error)	
*/
export const catchErrors = (promise, errorHandler) => {
	return promise.then(data => data).catch(errorHandler);
};

/**
 *  This function is useful for validating whether required fields exist on an object.
 *  Note: The validation is shallow (i.e. it doesn't work on nested fields)
 * @param {array} fields
 * @param {object} obj
 */

export const validateFields = (fields = [], obj = {}) => {
	return fields.every(field => field in obj);
};

// Generates a random hex value any time it's called
export const randomColor = () =>
	"#" + ((Math.random() * 0xffffff) << 0).toString(16);

// Ensure a function is only invoked once. The intial call to the function
// gets cached, and if it's run again, that cached value gets returned.
export const once = callback => {
	let ran = false,
		memo;

	return function (...args) {
		if (ran) {
			return memo;
		} else {
			ran = true;
			memo = callback(...args);
			return memo;
		}
	};
};

// Map a collection and then reduce it.
export const foldMap = curry((mapperFn, reducerFn, arr) => {
	return arr.map(mapperFn).reduce(reducerFn);
});

// Return a Left if it's null, and a Right if not null.
export const fromNullable = curry((x, errMsg = null) =>
	x != null ? Right(x) : Left(errMsg)
);

// The function equivalent of a try-catch block.
export const tryCatch = f => {
	try {
		return Right(f());
	} catch (e) {
		return Left(e);
	}
};

/**
 * Determines if two objects are equal by value.
 * It also works for arrays.
 * @param {(Object|Array)} o1
 * @param {Object|Array} o2
 * @returns {Boolean}
 */
function isEqual(o1, o2) {
	if (Array.isArray(o1) && Array.isArray(o2)) {
		for (let i = 0; i < o1.length; i++) {
			if (o1[i] === o2[i]) {
				continue;
			} else {
				return false;
			}
		}
		return true;
	} else if (typeof o1 == "object" && typeof o2 == "object") {
		const o1Keys = Object.keys(o1);
		const o2Keys = Object.keys(o2);

		for (let i = 0; i < o1Keys.length; i++) {
			if (o1Keys[i] == o2Keys[i]) {
				continue;
			} else {
				return false;
			}
		}
		return true;
	} else {
		throw new TypeError(
			"You must pass in either an object or array to this function."
		);
	}
}

export function coroutine(generator) {
	const iterator = generator();
	return function (...args) {
		return iterator.next(...args);
	};
}

// generate unique IDs indefinitely.
export const generateIds = coroutine(function* () {
	let id = 0;
	while (true) {
		yield ++id;
	}
});

export function consumeGeneratorUntilCompletion(
	generator,
	reducer,
	initialValue
) {
	const it = generator();
	function consume(iterator, accumulator, cb) {
		const { value, done } = iterator.next();
		accumulator = cb(accumulator, value);
		return done == true ? accumulator : consume(iterator, accumulator, cb);
	}
	return consume(it, initialValue, reducer);
}
